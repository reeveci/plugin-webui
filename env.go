package main

import (
	"fmt"
	"sort"
	"sync"

	"github.com/reeveci/reeve-lib/schema"
)

type EnvBundle struct {
	BundleID string                `json:"bundleID"`
	Env      map[string]schema.Env `json:"env"`
	Prompts  []Prompt              `json:"prompts"`
}

type Prompt struct {
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	NameOption  string         `json:"nameOption"`
	ValueOption string         `json:"valueOption"`
	Secret      bool           `json:"secret"`
	Message     schema.Message `json:"message"`
}

type FullEnv struct {
	schema.Env
	ID     string `json:"id"`
	Name   string `json:"name"`
	Plugin string `json:"plugin"`
}

type FullPrompt struct {
	Prompt
	Plugin string `json:"plugin"`
}

type StoredEnv struct {
	FullEnv
	refs int
}

type StoredPrompt struct {
	FullPrompt
	refs int
}

type ClientEnv struct {
	Value    string `json:"value"`
	Priority uint32 `json:"priority"`
	Secret   bool   `json:"secret"`
	Plugin   string `json:"plugin"`
}

type ClientPrompt struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Secret bool   `json:"secret"`
	Plugin string `json:"plugin"`
}

type ClientEnvData struct {
	Env     map[string][]ClientEnv `json:"env"`
	Prompts []ClientPrompt         `json:"prompts"`
}

func NewEnvStore() *EnvStore {
	return &EnvStore{
		EnvBundles:    make(map[string][]*StoredEnv),
		Env:           make(map[string]*StoredEnv),
		PromptBundles: make(map[string][]*StoredPrompt),
		Prompts:       make(map[string]*StoredPrompt),
		Data:          new(ClientEnvData),
	}
}

type EnvStore struct {
	EnvBundles    map[string][]*StoredEnv
	Env           map[string]*StoredEnv
	PromptBundles map[string][]*StoredPrompt
	Prompts       map[string]*StoredPrompt
	Data          *ClientEnvData

	sync.Mutex
}

func (s *EnvStore) Register(plugin string, bundle EnvBundle) error {
	s.Lock()
	defer s.Unlock()

	if plugin == "" {
		return fmt.Errorf("missing plugin name")
	}
	if bundle.BundleID == "" {
		return fmt.Errorf("missing bundle ID")
	}

	bundleHandle := plugin + "-" + bundle.BundleID

	if existing, ok := s.EnvBundles[bundleHandle]; ok {
		for _, env := range existing {
			env.refs -= 1
			if env.refs < 1 {
				delete(s.Env, env.ID)
			}
		}
	}

	if len(bundle.Env) == 0 {
		delete(s.EnvBundles, bundleHandle)
	} else {
		storedBundle := make([]*StoredEnv, 0, len(bundle.Env))

		for name, env := range bundle.Env {
			envHandle := plugin + "-" + name

			storedEnv, ok := s.Env[envHandle]
			if !ok {
				storedEnv = &StoredEnv{refs: 0}
				s.Env[envHandle] = storedEnv
			}
			storedEnv.Env = env
			storedEnv.Name = name
			storedEnv.Plugin = plugin
			storedEnv.ID = envHandle
			storedEnv.refs += 1

			storedBundle = append(storedBundle, storedEnv)
		}

		s.EnvBundles[bundleHandle] = storedBundle
	}

	if existing, ok := s.PromptBundles[bundleHandle]; ok {
		for _, prompt := range existing {
			prompt.refs -= 1
			if prompt.refs < 1 {
				delete(s.Prompts, prompt.ID)
			}
		}
	}

	if len(bundle.Prompts) == 0 {
		delete(s.PromptBundles, bundleHandle)
	} else {
		storedBundle := make([]*StoredPrompt, 0, len(bundle.Prompts))

		for _, prompt := range bundle.Prompts {
			if prompt.ID == "" {
				continue
			}

			promptHandle := plugin + "-" + prompt.ID

			storedPrompt, ok := s.Prompts[promptHandle]
			if !ok {
				storedPrompt = &StoredPrompt{refs: 0}
				s.Prompts[promptHandle] = storedPrompt
			}
			storedPrompt.Prompt = prompt
			storedPrompt.Plugin = plugin
			storedPrompt.ID = promptHandle
			storedPrompt.refs += 1

			storedBundle = append(storedBundle, storedPrompt)
		}

		s.PromptBundles[bundleHandle] = storedBundle
	}

	s.apply()

	return nil
}

type EnvByPriority []ClientEnv

func (s EnvByPriority) Len() int {
	return len(s)
}

func (s EnvByPriority) Less(i, j int) bool {
	if s[i].Priority == s[j].Priority {
		return s[i].Plugin < s[j].Plugin
	}
	return s[i].Priority < s[j].Priority
}

func (s EnvByPriority) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

type PromptByName []FullPrompt

func (s PromptByName) Len() int {
	return len(s)
}

func (s PromptByName) Less(i, j int) bool {
	if s[i].Name == s[j].Name {
		return s[i].Plugin < s[j].Plugin
	}
	return s[i].Name < s[j].Name
}

func (s PromptByName) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

func (s *EnvStore) apply() {
	prompts := make([]FullPrompt, 0, len(s.Prompts))
	for _, prompt := range s.Prompts {
		prompts = append(prompts, prompt.FullPrompt)
	}
	sort.Sort(PromptByName(prompts))

	data := new(ClientEnvData)

	data.Env = make(map[string][]ClientEnv)
	for _, env := range s.Env {
		data.Env[env.Name] = append(data.Env[env.Name], ClientEnv{Value: env.Value, Priority: env.Priority, Secret: env.Secret, Plugin: env.Plugin})
	}
	for _, env := range data.Env {
		sort.Sort(EnvByPriority(env))
	}

	for _, prompt := range prompts {
		data.Prompts = append(data.Prompts, ClientPrompt{ID: prompt.ID, Name: prompt.Name, Secret: prompt.Secret, Plugin: prompt.Plugin})
	}

	s.Data = data
}
