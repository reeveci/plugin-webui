import { useRouteError } from 'react-router';
import styled from 'styled-components';

const ErrorPage = styled.div`
  flex: 1 0 0px;
  min-width: 0px;
  height: 100%;
  width: 100%;
  overflow: auto;
`;

const PageContent = styled.div`
  margin: 2rem auto;
  padding: 2rem 4rem;
  text-align: center;
`;

const Title = styled.h1``;

const Description = styled.p``;

const Status = styled.p``;

function Error() {
  const error = useRouteError();
  console.log(error);

  return (
    <ErrorPage>
      <PageContent>
        <Title>Oops!</Title>
        <Description>Sorry, an unexpected error has occured.</Description>
        <Status>
          <i>{error.statusText || error.message}</i>
        </Status>
      </PageContent>
    </ErrorPage>
  );
}

export default Error;
