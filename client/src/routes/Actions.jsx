import { useConfigContext, useResource } from "@civet/core";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import debounce from "lodash.debounce";
import React from "react";
import styled, { css, keyframes } from "styled-components";
import { useAutoUpdate } from "../Civet";
import { Button, Input } from "../styles";

const ActionsPage = styled.div`
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
  z-index: 1;
  position: sticky;
  top: 1rem;
  background-color: #f7f7f7b2;
  border-radius: 8px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0.75rem;
  box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
  margin: 1rem -0.5rem;

  @media (prefers-color-scheme: dark) {
    background-color: #232323b2;
    border-bottom-color: #5c5c5c;
  }
`;

const ActionSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.5rem 8px;
`;

const Table = styled.table`
  color: inherit;
  width: 100%;
  font-size: 1rem;
  border: none;
  line-height: 1.5;
  margin: 1.5rem auto;
  border-spacing: 0.25rem 0.5rem;

  &:first-child {
    margin-top: 0;
  }
  &:last-child {
    margin-bottom: 0;
  }
`;

const TableContent = styled.tbody``;

const HeaderRow = styled.tr``;

const Header = styled.td`
  padding: 0px;
  font-size: 0.8em;
  font-stretch: semi-condensed;
  text-transform: uppercase;
  color: #3992ff;
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ContentRow = styled.tr``;

const MainContent = styled.td`
  min-width: 100%;
  max-width: 0px;
  overflow: auto;
  padding: 0.5rem 0;

  @media only screen and (max-width: 767px) {
    padding: 0.25rem 0;
  }
`;

const Content = styled(MainContent)`
  overflow: visible;
  border-left: 1px solid #e3e3e3;
  padding-left: 1.5rem;

  @media (prefers-color-scheme: dark) {
    border-left-color: #5c5c5c;
  }

  @media only screen and (max-width: 767px) {
    padding-left: 1rem;
  }
`;

const successAnimation = css`
  animation: ${keyframes`
    0% { border: 1px solid hsl(98, 98%, 42%); }
    50% { border: 1px solid hsl(98, 98%, 42%); }
    100% { border: 1px solid transparent; }
  `} 1s;
`;

const errorAnimation = css`
  animation: ${keyframes`
    0% { border: 1px solid #f44250; }
    50% { border: 1px solid #f44250; }
    100% { border: 1px solid transparent; }
  `} 1s;
`;

const ActionButton = styled(Button)`
  min-width: 5rem;
  user-select: none;
  -webkit-user-select: none;
  text-transform: capitalize;
  border: 1px solid transparent;

  ${({ $status }) => {
    switch ($status) {
      case "success":
        return successAnimation;

      case "error":
        return errorAnimation;

      default:
        return "";
    }
  }}

  & > i {
    font-size: 0.9em;
  }
`;

const StatusMessage = styled.p`
  margin: 1rem auto;
  padding: 2rem 0;
  text-align: center;
`;

function search(data, terms) {
  let s;

  const searchGroup = (name, group, terms) => {
    if (!terms.length) return {};
    const remainingTerms = terms.filter(
      (term) => !name.replace(/-/g, " ").toLowerCase().includes(term),
    );
    if (remainingTerms.length) return s(group, remainingTerms);
    return group;
  };

  const searchActions = (actions, terms) => {
    if (!terms.length) return [];
    return actions.filter((action) =>
      terms.every((term) =>
        (action.name || action.id)
          ?.replace(/-/g, " ")
          .toLowerCase()
          .includes(term),
      ),
    );
  };

  s = (data, terms) => {
    const groups = Object.entries(data?.groups ?? {})
      .map(([name, item]) => [name, searchGroup(name, item, terms)])
      .filter(([, { groups, actions }]) => groups || actions?.length);
    return {
      ...data,
      groups: groups.length ? Object.fromEntries(groups) : undefined,
      actions: searchActions(data?.actions ?? [], terms),
    };
  };

  return s(data, terms);
}

function getActions(data, query) {
  if (!data?.actions?.length && !Object.keys(data?.groups || {}).length) {
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

function Actions() {
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
    data: [actions],
    isLoading,
    isInitial,
    error,
    notify,
  } = useResource({
    name: "actions",
    query: { search: debouncedSearch },
    options: { getItems: getActions },
    persistent: true,
  });

  useAutoUpdate(notify, 5000);

  return (
    <ActionsPage>
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

        {!error &&
        (Object.keys(actions?.groups ?? {}).length ||
          actions?.actions?.length) ? (
          <Table>
            <TableContent>
              <ContentRow>
                <MainContent>
                  <ActionGroup {...actions} />
                </MainContent>
              </ContentRow>
            </TableContent>
          </Table>
        ) : (
          <StatusMessage>
            <i>
              {error
                ? `Error loading actions: ${error.statusText || error.message}`
                : isLoading && isInitial
                  ? "Loading..."
                  : "No actions available"}
            </i>
          </StatusMessage>
        )}
      </PageContent>
    </ActionsPage>
  );
}

export default Actions;

function ActionGroup({ groups, actions }) {
  return (
    <>
      {groups
        ? Object.entries(groups).map(([name, item]) => (
            <SubGroup {...item} key={name} name={name} />
          ))
        : null}

      {actions?.length ? (
        <ActionSection>
          {actions.map((action) => (
            <Action {...action} key={action.id} />
          ))}
        </ActionSection>
      ) : null}
    </>
  );
}

function SubGroup({ name, groups, actions }) {
  const [visible, setVisible] = React.useState(true);
  const handleToggleVisible = React.useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  return (
    <Table>
      <TableContent>
        <HeaderRow>
          <Header onClick={handleToggleVisible}>
            <FontAwesomeIcon
              icon={visible ? faAngleDown : faAngleRight}
              fixedWidth
            />
            {name.replace(/-/g, " ")}
          </Header>
        </HeaderRow>

        {visible ? (
          <ContentRow>
            <Content>
              <ActionGroup groups={groups} actions={actions} />
            </Content>
          </ContentRow>
        ) : null}
      </TableContent>
    </Table>
  );
}

function Action({ id, name, plugin }) {
  const { dataProvider } = useConfigContext();

  const [status, setStatus] = React.useState(undefined);

  const handleClick = React.useCallback(async () => {
    setStatus(undefined);
    try {
      await dataProvider.create(`actions/${encodeURIComponent(id)}`, {});
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }, [dataProvider, id]);

  return (
    <ActionButton key={id} onClick={handleClick} $status={status}>
      {(name || id).replace(/-/g, " ")}
      <br />
      <i>{plugin}</i>
    </ActionButton>
  );
}
