import { faBars, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import styled from 'styled-components';
import AuthContext from '@/AuthContext';
import { APP_NAME, TOKEN_COOKIE } from '@/environment';
import { Button, Title } from '@/styles';
import { clearCookie } from '@/token';

const MenuButton = styled(Button)`
  margin: 0 0 0 1rem;
  color: inherit;
`;

const Nav = styled.nav`
  position: relative;
  flex: 1;
  overflow: auto;
  padding-top: 0.6rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
`;

const SideBar = styled.div`
  flex-shrink: 0;
  width: 100%;
  padding: 0;
  background-color: #f7f7f7;
  display: flex;
  flex-direction: column;

  @media (prefers-color-scheme: dark) {
    background-color: #232323;
  }

  ${Title} {
    margin: 0 1rem;
  }

  @media (min-width: 768px) {
    width: 22rem;
    height: 100%;

    ${MenuButton} {
      display: none;
    }
  }

  @media (max-width: 767.9px) {
    ${({ $menuVisible }) =>
      $menuVisible
        ? `
          height: 100%;
          `
        : `
          height: auto;

          ${Title} {
            border-bottom: none;
          }

          ${Nav} {
            display: none;
          }
          `}
  }
`;

const TitleLink = styled(Link)`
  color: inherit;
  text-decoration: none;
`;

const SignOutButton = styled(Button)`
  margin: 0 0 0 auto;
  color: inherit;
  visibility: ${({ onClick }) => (onClick ? undefined : 'hidden')};
`;

const NavList = styled.ul`
  padding: 0;
  margin: 0 1rem;
  list-style: none;

  & + & {
    border-top: 1px solid #e3e3e3;
    margin-top: 0.83em;
    padding-top: 0.83em;

    @media (prefers-color-scheme: dark) {
      border-top-color: #5c5c5c;
    }
  }
`;

const NavListItem = styled.li`
  margin: 0.4rem 0.5rem;

  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow: hidden;
    line-height: 1.75;
    white-space: pre;
    padding: 0.5rem;
    text-transform: capitalize;
    border-radius: 8px;
    color: inherit;
    text-decoration: none;
    gap: 1rem;
  }

  a:hover {
    background-color: #e3e3e3;

    @media (prefers-color-scheme: dark) {
      background-color: #5c5c5c;
    }
  }

  a.active {
    background-color: hsl(224, 98%, 58%);
    color: white;
  }
`;

const Detail = styled.div`
  @media (min-width: 768px) {
    min-width: 0px;
    height: 100%;
  }

  @media (max-width: 767.9px) {
    ${({ $menuVisible }) =>
      $menuVisible
        ? `
          display: none;
          `
        : ''}
  }

  flex: 1 0 0px;
  min-height: 0px;
  display: flex;
  flex-direction: column;
`;

function App() {
  const { accessTokenPayload } = useContext(AuthContext);

  const canSignOut = accessTokenPayload?.origin !== 'basic';
  const handleSignOut = useMemo(
    () =>
      canSignOut
        ? () => {
            clearCookie(TOKEN_COOKIE);
            document.location.reload();
          }
        : undefined,
    [canSignOut],
  );

  const [menuVisible, setMenuVisible] = useState(false);

  const handleToggleMenu = useCallback(() => {
    setMenuVisible((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuVisible(false);
  }, []);

  return (
    <>
      <SideBar $menuVisible={menuVisible}>
        <Title>
          <TitleLink to="/" onClick={closeMenu}>
            {APP_NAME}
          </TitleLink>

          <SignOutButton onClick={handleSignOut}>
            <FontAwesomeIcon icon={faRightFromBracket} /> Sign out
          </SignOutButton>

          <MenuButton onClick={handleToggleMenu}>
            <FontAwesomeIcon icon={faBars} fixedWidth />
          </MenuButton>
        </Title>

        <Nav>
          <NavList>
            <NavItem href="pipelines" closeMenu={closeMenu}>
              Pipelines
            </NavItem>

            <NavItem href="actions" closeMenu={closeMenu}>
              Actions
            </NavItem>

            <NavItem href="environment" closeMenu={closeMenu}>
              Environment
            </NavItem>
          </NavList>
        </Nav>
      </SideBar>

      <Detail $menuVisible={menuVisible}>
        <Outlet />
      </Detail>
    </>
  );
}

export default App;

function NavItem({ href, closeMenu, children }) {
  return (
    <NavListItem>
      <NavLink
        to={href}
        className={({ isActive }) => (isActive ? 'active' : '')}
        onClick={closeMenu}
      >
        {children}
      </NavLink>
    </NavListItem>
  );
}
