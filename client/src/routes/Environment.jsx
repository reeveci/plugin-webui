import { useConfigContext, useResource } from '@civet/core';
import {
  faAdd,
  faAngleDown,
  faAngleRight,
  faLock,
  faTrash,
  faX,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import styled from 'styled-components';
import { Button, Input, Select, TextArea } from '@/styles';
import useAutoUpdate from '@/useAutoUpdate';

const EnvironmentPage = styled.div`
  flex: 1 0 0px;
  min-width: 0px;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const PageContent = styled.div`
  margin: 1rem auto;
  padding: 2rem 4rem;

  @media (max-width: 767.9px) {
    padding: 1rem 2rem;
  }
`;

const Table = styled.table`
  color: inherit;
  width: 100%;
  font-size: 1rem;
  border: none;
  line-height: 1.5;
  margin: 2.5rem auto;
  border-spacing: 0.25rem 0.5rem;
`;

const TableContent = styled.tbody``;

const EnvRow = styled.tr``;

const EnvKey = styled.td`
  padding: 0.5rem;
  max-width: 0px;
  overflow: hidden;
  font-stretch: semi-condensed;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: inherit;
  user-select: none;
  -webkit-user-select: none;
  transition: 0.4s color ease-out;

  ${({ onClick }) =>
    onClick
      ? `
        cursor: pointer;

        &:hover {
          color: #3992ff;
        }
        `
      : ''}
`;

const EnvDetail = styled.td`
  padding: 0.5rem;
  max-width: 0px;
  overflow: hidden;
  text-align: center;
  font-size: 0.9em;
  font-stretch: semi-condensed;
  text-transform: capitalize;
  text-overflow: ellipsis;
  white-space: nowrap;

  & > i {
    font-size: 0.9em;
    text-transform: capitalize;
  }
`;

const EnvValue = styled.td`
  padding: 0.5rem;
  max-width: 0px;
  background-color: #f7f7f7;
  border-radius: 8px;
  overflow: hidden;
  font-stretch: semi-condensed;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (prefers-color-scheme: dark) {
    background-color: #232323;
  }

  ${({ $sub }) =>
    $sub
      ? `
        background-color: transparent;
        border: 1px solid #f7f7f7;

        @media (prefers-color-scheme: dark) {
          border-color: #232323;
        }
      `
      : ''}
`;

const EnvControl = styled.td`
  padding: 0.25rem 0.5rem;
  max-width: 0px;
  text-align: end;
  font-size: 0.9em;
`;

const StatusMessage = styled.p`
  margin: 1rem auto;
  padding: 2rem 0;
  text-align: center;
`;

const StyledButton = styled(Button)`
  font-size: 0.9em;
  padding: 0.5em 0.75em;
`;

const StyledBarButton = styled(StyledButton)`
  color: inherit;
`;

const Blur = styled.div`
  z-index: 1;
  ${({ $position }) => $position || 'top'}: 0;
  background-color: #ffffffb2;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  height: 1rem;
  ${({ $position }) => `margin-${$position || 'top'}`}: -1rem;

  @media (prefers-color-scheme: dark) {
    background-color: #161616b2;
  }

  @media (min-height: 512px) {
    position: sticky;
  }
`;

const SearchSection = styled.div`
  z-index: 2;
  top: 1rem;
  background-color: #f7f7f7b2;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
  margin: 1rem -0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;

  @media (prefers-color-scheme: dark) {
    background-color: #232323b2;
    border-bottom-color: #5c5c5c;
  }

  @media (min-height: 512px) {
    position: sticky;
  }
`;

const PromptSection = styled.div`
  z-index: 2;
  bottom: 1rem;
  background-color: #f7f7f7b2;
  border-radius: 8px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0.75rem 0.5rem;
  box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
  margin: 1rem -0.5rem;

  @media (prefers-color-scheme: dark) {
    background-color: #232323b2;
    border-bottom-color: #5c5c5c;
  }

  @media (min-height: 512px) {
    position: sticky;
  }
`;

const PromptTable = styled.table`
  color: inherit;
  width: 100%;
  font-size: 1rem;
  border: none;
  line-height: 1.5;
  margin: 0;
  border-spacing: 0.25rem 0;
`;

const PromptTableContent = styled.tbody``;

const PromptRow = styled.tr``;

const PromptCell = styled.td`
  padding: 0;
  max-width: 0px;
  font-size: 0.9em;
  font-stretch: semi-condensed;
  white-space: nowrap;
`;

const PromptSecret = styled.td`
  padding: 0;
  max-width: 0px;
  font-size: 0.9em;
  text-align: center;
  font-stretch: semi-condensed;
  white-space: nowrap;
`;

const PromptControl = styled.td`
  padding: 0.25rem 0.5rem;
  max-width: 0px;
  text-align: end;
  font-size: 0.9em;
`;

const PromptSelectSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const PromptSelect = styled(Select)`
  margin: 0 0.25rem 1rem 0.25rem;
  text-transform: capitalize;
`;

const PromptInput = styled(Input)`
  width: 100%;
`;

const PromptTextArea = styled(TextArea)`
  width: 100%;
  resize: none;
`;

function search(data, terms) {
  const env = Object.entries(data?.env ?? {}).filter(([name]) =>
    terms.every((term) => name.replace(/-/g, ' ').toLowerCase().includes(term)),
  );
  return {
    ...data,
    env: env.length ? Object.fromEntries(env) : undefined,
  };
}

function getEnvironment(data, query) {
  if (!Object.keys(data?.env || {}).length) {
    return [];
  }
  if (query?.search?.trim())
    return [
      search(
        data,
        query.search
          .split(' ')
          .filter(Boolean)
          .map((term) => term.replace(/-/g, ' ').toLowerCase()),
      ),
      data,
    ];
  return [data, data];
}

function Environment() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q') ?? '';
  const setSearch = useCallback(
    (value) => {
      setSearchParams(
        (searchParams) => {
          if (value) searchParams.set('q', value);
          else searchParams.delete('q');
          return searchParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const handleSearchChange = useCallback(
    (event) => {
      setSearch(event.target.value || '');
    },
    [setSearch],
  );
  const handleSearchClear = useCallback(() => {
    setSearch('');
  }, [setSearch]);

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const updateDebouncedSearch = useMemo(
    () => debounce(setDebouncedSearch, 100),
    [],
  );
  useEffect(() => {
    updateDebouncedSearch(search);
  }, [updateDebouncedSearch, search]);

  const {
    data: [env, unfiltered],
    isLoading,
    isInitial,
    error,
    notify,
  } = useResource({
    name: 'environment',
    query: { search: debouncedSearch },
    options: { getItems: getEnvironment },
    persistent: true,
  });

  useAutoUpdate(notify, 2000);

  const prompts = useMemo(() => {
    const map = {};
    env?.prompts?.forEach(({ id, name, secret, plugin }) => {
      if (!id || !name) return;
      const key = plugin + '-' + name;
      if (!Object.hasOwn(map, key)) map[key] = { key, name, plugin };
      map[key][secret ? 'secret' : 'variable'] = id;
    });
    return Object.values(map).sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      if (a.plugin < b.plugin) return -1;
      if (a.plugin > b.plugin) return 1;
      return 0;
    });
  }, [env]);

  const unsetPrompts = useMemo(() => {
    const map = {};
    env?.prompts?.forEach(({ id, name, secret, plugin }) => {
      if (!id || !name) return;
      if (!Object.hasOwn(map, plugin)) map[plugin] = {};
      map[plugin][secret ? 'secret' : 'variable'] = id;
    });
    return map;
  }, [env]);

  const known = useMemo(() => {
    const map = {};
    Object.entries(unfiltered?.env ?? {})?.forEach(([name, entries]) => {
      entries.forEach(({ plugin }) => {
        if (!Object.hasOwn(map, plugin)) map[plugin] = [];
        map[plugin].push(name);
      });
    });
    return map;
  }, [unfiltered]);

  return (
    <EnvironmentPage>
      <Blur $position="top" />

      <PageContent>
        <SearchSection>
          <Input
            style={{ flexGrow: 1 }}
            placeholder="Search"
            aria-label="Search"
            type="text"
            name="search"
            autoFocus
            value={search}
            onChange={handleSearchChange}
          />

          <StyledBarButton onClick={handleSearchClear}>
            <FontAwesomeIcon icon={faX} fixedWidth />
          </StyledBarButton>
        </SearchSection>

        {!error && Object.keys(env?.env ?? {}).length ? (
          <Table>
            <TableContent>
              {Object.entries(env.env).map(([key, [entry, ...subEntries]]) => (
                <EnvItem
                  key={key}
                  name={key}
                  entry={entry}
                  more={subEntries}
                  unsetPrompts={unsetPrompts}
                />
              ))}
            </TableContent>
          </Table>
        ) : (
          <StatusMessage>
            <i>
              {error
                ? `Error loading environment variables: ${error.statusText || error.message}`
                : isLoading && isInitial
                  ? 'Loading...'
                  : 'No environment variables available'}
            </i>
          </StatusMessage>
        )}

        {!error && prompts.length ? (
          <PromptSection>
            <Prompt prompts={prompts} known={known} />
          </PromptSection>
        ) : null}
      </PageContent>

      {!error && prompts.length ? <Blur $position="bottom" /> : null}
    </EnvironmentPage>
  );
}

export default Environment;

function EnvItem({ name, entry, more, unsetPrompts }) {
  const [collapsed, setCollapsed] = useState(true);
  const toggle = useCallback(() => {
    setCollapsed((collapsed) => !collapsed);
  }, []);

  return (
    <>
      <EnvItemRow
        name={name}
        {...entry}
        collapsed={collapsed}
        toggleCollapsed={more.length ? toggle : undefined}
        unsetPromptID={
          unsetPrompts[entry.plugin]?.[entry.secret ? 'secret' : 'variable']
        }
      />

      {collapsed
        ? null
        : more.map((entry) => (
            <EnvItemRow
              key={entry.plugin}
              sub
              name={name}
              {...entry}
              unsetPromptID={
                unsetPrompts[entry.plugin]?.[
                  entry.secret ? 'secret' : 'variable'
                ]
              }
            />
          ))}
    </>
  );
}

function EnvItemRow({
  name,
  plugin,
  priority,
  secret,
  value,
  sub,
  collapsed,
  toggleCollapsed,
  unsetPromptID,
}) {
  const { dataProvider } = useConfigContext();

  const handleUnset = useCallback(async () => {
    if (!unsetPromptID) return;

    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      await dataProvider.create(
        `prompts/${encodeURIComponent(unsetPromptID)}`,
        { name, value: '' },
      );
    } catch {
      // do nothing
    }
  }, [dataProvider, unsetPromptID, name]);

  return (
    <EnvRow title={`${name} - ${plugin} (Priority ${priority || 0})`}>
      {toggleCollapsed ? (
        <EnvKey width="30%" onClick={toggleCollapsed}>
          <FontAwesomeIcon
            icon={collapsed ? faAngleRight : faAngleDown}
            fixedWidth
            size="sm"
          />
          {sub ? null : name}
        </EnvKey>
      ) : (
        <EnvKey width="30%">{sub ? null : name}</EnvKey>
      )}

      <EnvDetail width="15%">
        <i>{plugin}</i> <small>({priority || 0})</small>
      </EnvDetail>

      <EnvValue
        $sub={sub}
        width={unsetPromptID ? '40%' : '55%'}
        colSpan={unsetPromptID ? 1 : 2}
        title={secret ? '[secret] •••••••' : value}
      >
        {secret ? (
          <>
            <FontAwesomeIcon icon={faLock} size="xs" /> •••••••
          </>
        ) : (
          value
        )}
      </EnvValue>

      {unsetPromptID ? (
        <EnvControl width="15%">
          <StyledButton onClick={handleUnset}>
            <FontAwesomeIcon icon={faTrash} fixedWidth />
          </StyledButton>
        </EnvControl>
      ) : null}
    </EnvRow>
  );
}

function Prompt({ prompts, known }) {
  const { dataProvider } = useConfigContext();

  const [type, setType] = useState(prompts[0].key);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [secret, setSecret] = useState(false);

  if (!prompts.some((entry) => entry.key === type)) {
    setType(prompts[0].key);
  }

  const handleTypeChange = useCallback((event) => {
    setType(event.target.value);
  }, []);

  const handleNameChange = useCallback((event) => {
    setName(event.target.value || '');
  }, []);

  const handleValueChange = useCallback((event) => {
    setValue(event.target.value || '');
  }, []);

  const handleSecretChange = useCallback((event) => {
    setSecret(!!event.target.checked);
  }, []);

  const prompt = useMemo(
    () => prompts.find((entry) => entry.key === type),
    [type, prompts],
  );

  if (secret && !prompt.secret) setSecret(false);
  if (!secret && !prompt.variable) setSecret(true);

  const promptID = prompt?.[secret ? 'secret' : 'variable'];
  const alreadySet = useMemo(() => {
    if (!name || !prompt?.plugin) return false;
    return known[prompt?.plugin]?.includes(name);
  }, [name, known, prompt]);

  const handleSet = useCallback(async () => {
    if (!promptID) return;

    if (
      alreadySet &&
      !confirm(`${name} is already set.\nDo you want to replace it?`)
    ) {
      return;
    }

    try {
      await dataProvider.create(`prompts/${encodeURIComponent(promptID)}`, {
        name,
        value,
      });

      setName('');
      setValue('');
    } catch {
      // do nothing
    }
  }, [alreadySet, dataProvider, promptID, name, value]);

  return (
    <>
      <PromptSelectSection>
        <PromptSelect
          aria-label="Type"
          name="type"
          value={type}
          onChange={handleTypeChange}
        >
          {prompts.map(({ key, name, plugin }) => (
            <option key={key} value={key}>
              {name} ({plugin})
            </option>
          ))}
        </PromptSelect>
      </PromptSelectSection>

      <PromptTable>
        <PromptTableContent>
          <PromptRow>
            <PromptCell width="30%">
              <PromptInput
                placeholder="Name"
                aria-label="Name"
                type="text"
                name="name"
                value={name}
                onChange={handleNameChange}
              />
            </PromptCell>

            <PromptSecret width="15%">
              <input
                aria-label="Secret"
                type="checkbox"
                name="secret"
                id="secret"
                disabled={!prompt.variable || !prompt.secret}
                checked={secret}
                onChange={handleSecretChange}
                tabIndex={0}
              />
              <label htmlFor="secret" title="Secret">
                <FontAwesomeIcon icon={faLock} fixedWidth />
              </label>
            </PromptSecret>

            <PromptCell width="40%">
              <PromptTextArea
                placeholder="Value"
                aria-label="Value"
                type="text"
                name="value"
                value={value}
                onChange={handleValueChange}
                rows={value?.split('\n').length || 1}
              />
            </PromptCell>

            <PromptControl width="15%">
              <StyledBarButton disabled={!name || !value} onClick={handleSet}>
                <FontAwesomeIcon icon={faAdd} fixedWidth />
              </StyledBarButton>
            </PromptControl>
          </PromptRow>
        </PromptTableContent>
      </PromptTable>
    </>
  );
}
