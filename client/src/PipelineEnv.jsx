import {
  faAngleDown,
  faAngleRight,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";

const Table = styled.table`
  color: inherit;
  width: 100%;
  font-size: 1rem;
  border: none;
  line-height: 1.5;
  margin: 1rem auto;
  border-spacing: 0.25rem 0.5rem;
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
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const EnvRow = styled.tr``;

const EnvKey = styled.td`
  padding: 0.5rem;
  max-width: 0px;
  overflow: hidden;
  font-stretch: semi-condensed;
  text-overflow: ellipsis;
  white-space: nowrap;
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

function PipelineEnv({ pipeline }) {
  const env = pipeline?.pipeline?.env;

  const [visible, setVisible] = React.useState(false);
  const handleToggleVisible = React.useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  if (Object.keys(env || {}).length === 0) return null;

  return (
    <Table>
      <TableContent>
        <HeaderRow>
          <Header colSpan={2} onClick={handleToggleVisible}>
            <FontAwesomeIcon
              icon={visible ? faAngleDown : faAngleRight}
              fixedWidth
            />
            Environment variables
          </Header>
        </HeaderRow>

        {visible
          ? Object.entries(env).map(([key, entry]) => (
              <EnvRow key={key} title={key}>
                <EnvKey width="40%">{key}</EnvKey>

                <EnvValue
                  width="60%"
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
              </EnvRow>
            ))
          : null}
      </TableContent>
    </Table>
  );
}

export default PipelineEnv;
