import { useResource } from "@civet/core";
import {
  faAngleDown,
  faAngleRight,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import debounce from "lodash.debounce";
import React from "react";
import styled from "styled-components";
import { useAutoUpdate } from "../Civet";
import { Input } from "../styles";

const EnvPage = styled.div`
  flex: 1 0 0px;
  min-width: 0px;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const PageContent = styled.div`
  max-width: 50rem;
  margin: 1rem auto;
  padding: 2rem 4rem;

  @media only screen and (max-width: 767px) {
    padding: 1rem 2rem;
  }
`;

const SearchSection = styled.div`
  position: sticky;
  top: 1rem;
  background-color: #f7f7f7b2;
  border-radius: 8px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 1rem;
  box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
  margin: 1rem auto;

  @media (prefers-color-scheme: dark) {
    background-color: #232323b2;
    border-bottom-color: #5c5c5c;
  }
`;

const Table = styled.table`
  color: inherit;
  width: 100%;
  font-size: 1rem;
  border: none;
  line-height: 1.5;
  margin: 2.5rem auto 1rem auto;
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

  ${({ onClick }) =>
    onClick
      ? `
        color: #3992ff;
        user-select: none;
        cursor: pointer;
      `
      : ""}
`;

const EnvPlugin = styled.td`
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
`;

const EnvSubRow = styled(EnvRow)`
  & > ${EnvValue} {
    background-color: transparent;
  }
`;

const StatusMessage = styled.p`
  margin: 1rem auto;
  padding: 2rem 0;
  text-align: center;
`;

function search(data, terms) {
  const env = Object.entries(data?.env ?? {}).filter(([name]) =>
    terms.every((term) => name.replace(/-/g, " ").toLowerCase().includes(term)),
  );
  return {
    env: env.length ? Object.fromEntries(env) : undefined,
    prompts: data?.prompts,
  };
}

function getEnv(data, query) {
  if (!Object.keys(data?.env || {}).length) {
    return [];
  }
  if (query?.search?.trim())
    return [
      search(
        data,
        query.search
          .split(" ")
          .filter(Boolean)
          .map((term) => term.replace(/-/g, " ").toLowerCase()),
      ),
    ];
  return [data];
}

function Env() {
  const [search, setSearch] = React.useState("");

  const handleSearchChange = React.useCallback((event) => {
    setSearch(event.target.value || "");
  }, []);

  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const updateDebouncedSearch = React.useMemo(
    () => debounce(setDebouncedSearch, 500),
    [],
  );
  React.useEffect(() => {
    updateDebouncedSearch(search);
  }, [updateDebouncedSearch, search]);

  const {
    data: [env],
    isLoading,
    isInitial,
    error,
    notify,
  } = useResource({
    name: "environment",
    query: { search: debouncedSearch },
    options: { getItems: getEnv },
    persistent: true,
  });

  useAutoUpdate(notify, 5000);

  return (
    <EnvPage>
      <PageContent>
        <SearchSection>
          <Input
            placeholder="Search"
            aria-label="Search"
            type="text"
            name="search"
            autoFocus
            value={search}
            onChange={handleSearchChange}
          />
        </SearchSection>

        {!error && Object.keys(env?.env ?? {}).length ? (
          <Table>
            <TableContent>
              {Object.entries(env.env).map(([key, [entry, ...subEntries]]) => (
                <EnvItem key={key} name={key} {...entry} more={subEntries} />
              ))}
            </TableContent>
          </Table>
        ) : (
          <StatusMessage>
            <i>
              {error
                ? `Error loading environment variables: ${error.statusText || error.message}`
                : isLoading && isInitial
                  ? "Loading..."
                  : "No environment variables available"}
            </i>
          </StatusMessage>
        )}
      </PageContent>
    </EnvPage>
  );
}

export default Env;

function EnvItem({ name, plugin, priority, secret, value, more }) {
  const [collapsed, setCollapsed] = React.useState(true);
  const toggle = React.useCallback(() => {
    setCollapsed((collapsed) => !collapsed);
  }, []);

  return (
    <>
      <EnvRow title={name}>
        {more.length ? (
          <EnvKey width="30%" onClick={toggle}>
            {name}{" "}
            <FontAwesomeIcon
              icon={collapsed ? faAngleRight : faAngleDown}
              size="xs"
            />
          </EnvKey>
        ) : (
          <EnvKey width="30%">{name}</EnvKey>
        )}

        <EnvPlugin width="20%">
          <i>{plugin}</i> <small title="Priority">({priority || 0})</small>
        </EnvPlugin>

        <EnvValue width="50%" title={secret ? "[secret] •••••••" : value}>
          {secret ? (
            <>
              <FontAwesomeIcon icon={faLock} size="xs" /> •••••••
            </>
          ) : (
            value
          )}
        </EnvValue>
      </EnvRow>

      {collapsed
        ? null
        : more.map((entry) => (
            <EnvSubRow key={entry.plugin} title={name}>
              <EnvKey width="30%" />

              <EnvPlugin width="20%">
                <i>{entry.plugin}</i> <small>({priority})</small>
              </EnvPlugin>

              <EnvValue
                width="50%"
                title={entry.secret ? "[secret] •••••••" : entry.value}
              >
                {entry.secret ? (
                  <>
                    <FontAwesomeIcon icon={faLock} size="xs" /> •••••••
                  </>
                ) : (
                  entry.value
                )}
              </EnvValue>
            </EnvSubRow>
          ))}
    </>
  );
}
