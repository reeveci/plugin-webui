package main

import (
	"fmt"
	"sort"
	"sync"

	"github.com/reeveci/reeve-lib/schema"
)

type ActionBundle struct {
	BundleID string   `json:"bundleID"`
	Actions  []Action `json:"actions"`
}

type Action struct {
	ID      string         `json:"id"`
	Name    string         `json:"name"`
	Groups  []string       `json:"groups"`
	Message schema.Message `json:"message"`
}

type FullAction struct {
	Action
	Plugin string `json:"plugin"`
}

type StoredAction struct {
	FullAction
	refs int
}

type ClientAction struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Plugin string `json:"plugin"`
}

type ClientActionTreeNode struct {
	Actions []ClientAction                   `json:"actions"`
	Groups  map[string]*ClientActionTreeNode `json:"groups"`
}

func NewActionStore() *ActionStore {
	return &ActionStore{
		Bundles: make(map[string][]*StoredAction),
		Actions: make(map[string]*StoredAction),
		Data:    new(ClientActionTreeNode),
	}
}

type ActionStore struct {
	Bundles map[string][]*StoredAction
	Actions map[string]*StoredAction
	Data    *ClientActionTreeNode

	sync.Mutex
}

func (s *ActionStore) Register(plugin string, bundle ActionBundle) error {
	s.Lock()
	defer s.Unlock()

	if plugin == "" {
		return fmt.Errorf("missing plugin name")
	}
	if bundle.BundleID == "" {
		return fmt.Errorf("missing bundle ID")
	}

	bundleHandle := plugin + "-" + bundle.BundleID

	if existing, ok := s.Bundles[bundleHandle]; ok {
		for _, action := range existing {
			action.refs -= 1
			if action.refs < 1 {
				delete(s.Actions, action.ID)
			}
		}
	}

	if len(bundle.Actions) == 0 {
		delete(s.Bundles, bundleHandle)
	} else {
		storedBundle := make([]*StoredAction, 0, len(bundle.Actions))

		for _, action := range bundle.Actions {
			if action.ID == "" {
				continue
			}

			actionHandle := plugin + "-" + action.ID

			storedAction, ok := s.Actions[actionHandle]
			if !ok {
				storedAction = &StoredAction{refs: 0}
				s.Actions[actionHandle] = storedAction
			}
			storedAction.Action = action
			storedAction.Plugin = plugin
			storedAction.ID = actionHandle
			storedAction.refs += 1

			storedBundle = append(storedBundle, storedAction)
		}

		s.Bundles[bundleHandle] = storedBundle
	}

	s.apply()

	return nil
}

type ByName []FullAction

func (s ByName) Len() int {
	return len(s)
}

func (s ByName) Less(i, j int) bool {
	if s[i].Name == s[j].Name {
		return s[i].Plugin < s[j].Plugin
	}
	return s[i].Name < s[j].Name
}

func (s ByName) Swap(i, j int) {
	s[i], s[j] = s[j], s[i]
}

func (s *ActionStore) apply() {
	actions := make([]FullAction, 0, len(s.Actions))
	for _, action := range s.Actions {
		actions = append(actions, action.FullAction)
	}
	sort.Sort(ByName(actions))

	data := new(ClientActionTreeNode)

	for _, action := range actions {
		target := data
		for _, group := range action.Groups {
			if target.Groups == nil {
				target.Groups = map[string]*ClientActionTreeNode{
					group: new(ClientActionTreeNode),
				}
			}
			sub, ok := target.Groups[group]
			if !ok {
				sub = new(ClientActionTreeNode)
				target.Groups[group] = sub
			}
			target = sub
		}
		target.Actions = append(target.Actions, ClientAction{ID: action.ID, Name: action.Name, Plugin: action.Plugin})
	}

	s.Data = data
}
