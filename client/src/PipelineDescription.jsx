import { faAngleDown, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useCallback, useState } from 'react';
import rehypeSanitize from 'rehype-sanitize';
import styled from 'styled-components';

const rehypePlugins = [rehypeSanitize];

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
  -webkit-user-select: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ContentRow = styled.tr``;

const Content = styled.td`
  background-color: white;
  max-width: 0px;
  border-radius: 6px;
  overflow: auto;
  box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);

  @media (prefers-color-scheme: dark) {
    background-color: #0a0a0a;
  }

  & > * {
    background-color: transparent;
    min-width: calc(100% - 3rem);
    display: inline-block;
    margin: 0.5rem 1.5rem;
    width: calc(100% - 3rem);
  }
`;

function PipelineDescription({ pipeline }) {
  const [visible, setVisible] = useState(true);
  const handleToggleVisible = useCallback(() => {
    setVisible((prev) => !prev);
  }, []);

  if (!`${pipeline?.pipeline?.description || ''}`.trim()) return null;

  return (
    <Table>
      <TableContent>
        <HeaderRow>
          <Header onClick={handleToggleVisible}>
            <FontAwesomeIcon
              icon={visible ? faAngleDown : faAngleRight}
              fixedWidth
            />
            Description
          </Header>
        </HeaderRow>

        {visible ? (
          <ContentRow>
            <Content>
              <MarkdownPreview
                source={pipeline.pipeline.description}
                rehypePlugins={rehypePlugins}
              />
            </Content>
          </ContentRow>
        ) : null}
      </TableContent>
    </Table>
  );
}

export default PipelineDescription;
