import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router';
import styled from 'styled-components';
import { Status } from '@/styles';

const Card = styled.div`
  color: inherit;
  background-color: white;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0px 0px 1px hsla(0, 0%, 0%, 0.4);
  margin: 2rem auto;

  @media (prefers-color-scheme: dark) {
    background-color: #0a0a0a;
  }
`;

const DescriptionSection = styled.div`
  width: 100%;
  padding: 1.5rem 1rem;
`;

const Name = styled.div`
  font-weight: 500;
  transition: 0.4s color ease-out;
`;

const Headline = styled.div``;

const InfoSection = styled.div`
  overflow: hidden;
  width: 100%;
  display: flex;
  padding: 2px;
  gap: 2px;
`;

const InfoCell = styled.div`
  overflow: hidden;
  padding: 0.75rem 0.75rem;
  font-size: 0.9rem;
  color: #818181;
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;

  &:first-child {
    border-bottom-left-radius: 6px;
  }
  &:last-child {
    border-bottom-right-radius: 6px;
  }

  @media (prefers-color-scheme: dark) {
    background-color: #232323;
  }
`;

const StatusCell = styled(InfoCell)`
  flex: 1 0 auto;
  min-width: 33%;
`;

const StartCell = styled(InfoCell)`
  flex: 0 1 33%;
  min-width: 0;
`;

const ResultCell = styled(InfoCell)`
  flex: 0 1 33%;
  min-width: 0;
`;

const WorkerGroupLabel = styled.span`
  text-align: start;
  font-size: 0.9rem;
  font-weight: 500;
  font-stretch: semi-condensed;
  text-transform: capitalize;
  border-radius: 4px;
  padding: 0.125rem 0.5rem;
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: white;
  box-shadow:
    0px 0px 1px #ffffff32,
    0px 1px 2px #ffffff32;

  @media (prefers-color-scheme: dark) {
    background-color: #0a0a0a;
    box-shadow:
      0px 0px 1px #0a0a0a32,
      0px 1px 2px #0a0a0a32;
  }
`;

const StyledLink = styled(Link)`
  display: block;

  color: inherit;
  text-decoration: none;

  & > ${Card} {
    box-shadow:
      0 0px 1px hsla(0, 0%, 0%, 0.2),
      0 1px 2px hsla(0, 0%, 0%, 0.2);
  }

  & > ${Card}:hover {
    box-shadow:
      0 0px 1px hsla(0, 0%, 0%, 0.6),
      0 1px 2px hsla(0, 0%, 0%, 0.2);

    ${Name} {
      color: #3992ff;
    }
  }

  & > ${Card}:active {
    box-shadow: 0px 0px 1px hsla(0, 0%, 0%, 0.4);
    transform: translateY(1px);
  }
`;

function formatDuration(start, end) {
  const millis = Math.abs(end - start || 0);

  if (millis >= 3600000) {
    const h = Math.floor(millis / 3600000);
    const m = Math.floor((millis % 3600000) / 60000);
    return `${h}h ${m}m`;
  }

  const m = Math.floor(millis / 60000);
  const s = Math.floor((millis % 60000) / 1000);
  return `${m}m ${s}s`;
}

function PipelineSummary({ pipeline, href }) {
  const content = (
    <Card>
      <DescriptionSection>
        <Name>{pipeline.name}</Name>
        <Headline>
          <small>{pipeline.headline}</small>
        </Headline>
      </DescriptionSection>

      <InfoSection>
        <StatusCell>
          <WorkerGroupLabel>
            <FontAwesomeIcon icon={faLayerGroup} /> {pipeline.workerGroup}
          </WorkerGroupLabel>

          <Status $status={pipeline.status} $condensed>
            {pipeline.status}
          </Status>
        </StatusCell>

        <StartCell>
          {pipeline.startTime ? (
            <span>
              {new Date(pipeline.startTime).toLocaleDateString('en-US')}
              <br />
              {new Date(pipeline.startTime).toLocaleTimeString('en-US')}
            </span>
          ) : null}
        </StartCell>

        <ResultCell>
          {pipeline.result.exitCode !== -1 ? (
            <span>
              Status {pipeline.result.exitCode}
              <br />
              <span>
                {pipeline.startTime && pipeline.endTime
                  ? formatDuration(
                      new Date(pipeline.startTime),
                      new Date(pipeline.endTime),
                    )
                  : null}
              </span>
            </span>
          ) : null}
        </ResultCell>
      </InfoSection>
    </Card>
  );

  return href ? (
    <StyledLink to={href} tabIndex={0}>
      {content}
    </StyledLink>
  ) : (
    content
  );
}

export default PipelineSummary;
