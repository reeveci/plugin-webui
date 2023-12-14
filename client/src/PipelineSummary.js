import { Link } from "react-router-dom";
import styled from "styled-components";
import { Status } from "./styles";

const Name = styled.td`
  font-size: 1rem;
  font-weight: 500;
  padding: 1.5rem 1rem;
  transition: 0.4s color ease-out;
`;

const Card = styled.table`
  color: inherit;
  background-color: white;
  width: 100%;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
  line-height: 1.5;
  margin: 2rem auto;

  @media (prefers-color-scheme: dark) {
    background-color: #0a0a0a;
  }
`;

const CardContent = styled.tbody``;

const NameRow = styled.tr``;

const StatusRow = styled.tr``;

const StatusCell = styled.td`
  padding: 0.75rem 0.75rem;
  border: none;
  margin: 0;
  font-size: 0.9rem;
  color: #818181;
  background-color: #f7f7f7;

  :first-child {
    border-bottom-left-radius: 6px;
  }
  :last-child {
    border-bottom-right-radius: 6px;
  }

  @media (prefers-color-scheme: dark) {
    background-color: #232323;
  }
`;

const StyledLink = styled(Link)`
  display: block;

  color: inherit;
  text-decoration: none;

  > ${Card} {
    box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.2), 0 1px 2px hsla(0, 0%, 0%, 0.2);
  }

  > ${Card}:hover {
    box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.6), 0 1px 2px hsla(0, 0%, 0%, 0.2);

    ${Name} {
      color: #3992ff;
    }
  }

  > ${Card}:active {
    box-shadow: 0 0px 1px hsla(0, 0%, 0%, 0.4);
    transform: translateY(1px);
  }
`;

function PipelineSummary({ pipeline, href }) {
  const content = (
    <Card>
      <CardContent>
        <NameRow>
          <Name colSpan={3}>{pipeline.name}</Name>
        </NameRow>

        <StatusRow>
          <StatusCell width="20%">
            <Status status={pipeline.status}>{pipeline.status}</Status>
          </StatusCell>

          <StatusCell width="30%">
            {new Date(pipeline.startTime).toLocaleDateString("en-US")}
            <br />
            {new Date(pipeline.startTime).toLocaleTimeString("en-US")}
          </StatusCell>

          <StatusCell width="50%">
            {pipeline.result.exitCode !== -1 ? (
              <>
                Status {pipeline.result.exitCode}
                <br />
                <i>{pipeline.result.error || "\u200B"}</i>
              </>
            ) : null}
          </StatusCell>
        </StatusRow>
      </CardContent>
    </Card>
  );

  return href ? <StyledLink to={href}>{content}</StyledLink> : content;
}

export default PipelineSummary;
