import {Colors, Icon} from '@blueprintjs/core';
import * as React from 'react';
import {useHistory} from 'react-router';
import {Link, useRouteMatch} from 'react-router-dom';
import styled from 'styled-components/macro';

import {ShortcutHandler} from 'src/ShortcutHandler';
import {TimezonePicker} from 'src/TimeComponents';
import {WebsocketStatus} from 'src/WebsocketStatus';
import navBarImage from 'src/images/nav-logo-icon.png';
import navTitleImage from 'src/images/nav-title.png';
import {InstanceDetailsLink} from 'src/nav/InstanceDetailsLink';
import {RepositoryContentList} from 'src/nav/RepositoryContentList';
import {RepositoryPicker} from 'src/nav/RepositoryPicker';
import {SchedulesList} from 'src/nav/SchedulesList';
import {Group} from 'src/ui/Group';
import {Caption} from 'src/ui/Text';
import {useWorkspaceState, useRepositoryLocations} from 'src/workspace/WorkspaceContext';

const KEYCODE_FOR_1 = 49;

const INSTANCE_TABS = [
  {
    to: `/instance/runs`,
    tab: `runs`,
    icon: <Icon icon="history" iconSize={18} />,
    label: 'Runs',
  },
  {
    to: `/instance/assets`,
    tab: `assets`,
    icon: <Icon icon="panel-table" iconSize={18} />,
    label: 'Assets',
  },
  {
    to: `/instance/scheduler`,
    tab: `scheduler`,
    icon: <Icon icon="time" iconSize={18} />,
    label: 'Scheduler',
  },
];

const LeftNavRepositorySection = () => {
  const match = useRouteMatch<
    | {repoPath: string; selector: string; tab: string; rootTab: undefined}
    | {selector: undefined; tab: undefined; rootTab: string}
  >([
    '/workspace/:repoPath/pipelines/:selector/:tab?',
    '/workspace/:repoPath/solid/:selector',
    '/workspace/:repoPath/schedules/:selector',
    '/:rootTab?',
  ]);

  const {activeRepo, allRepos, loading} = useWorkspaceState();
  const {nodes: locations, refetch} = useRepositoryLocations();

  const anyErrors = locations.some((node) => node.__typename === 'RepositoryLocationLoadFailure');

  const onReload = () => {
    refetch();
  };

  return (
    <div
      className="bp3-dark"
      style={{
        background: `rgba(0,0,0,0.3)`,
        color: Colors.WHITE,
        display: 'flex',
        flex: 1,
        overflow: 'none',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <RepositoryPicker
        loading={loading}
        options={allRepos}
        repo={activeRepo?.repo || null}
        onReload={onReload}
      />
      {anyErrors ? (
        <Group
          background={Colors.GOLD5}
          padding={{vertical: 8, horizontal: 12}}
          direction="horizontal"
          spacing={8}
        >
          <Icon icon="warning-sign" color={Colors.DARK_GRAY3} iconSize={14} />
          <Caption color={Colors.DARK_GRAY3}>
            An error occurred while loading a repository.{' '}
            <DetailLink to="/workspace/repository-locations">View details</DetailLink>
          </Caption>
        </Group>
      ) : null}
      {activeRepo ? (
        <div style={{display: 'flex', flex: 1, flexDirection: 'column', minHeight: 0}}>
          <ItemHeader>{'Pipelines & Solids:'}</ItemHeader>
          <RepositoryContentList {...match?.params} repo={activeRepo.repo} />
          <ItemHeader>Schedules:</ItemHeader>
          <SchedulesList {...match?.params} repo={activeRepo.repo} />
        </div>
      ) : null}
    </div>
  );
};

export const LeftNav = () => {
  const history = useHistory();
  return (
    <LeftNavContainer>
      <div>
        <LogoContainer>
          <img
            alt="logo"
            src={navBarImage}
            style={{height: 40}}
            onClick={() => history.push('/')}
          />
          <LogoMetaContainer>
            <img src={navTitleImage} style={{height: 10}} alt="title" />
            <InstanceDetailsLink />
          </LogoMetaContainer>
          <LogoWebsocketStatus />
        </LogoContainer>
        {INSTANCE_TABS.map((t, i) => (
          <ShortcutHandler
            key={t.tab}
            onShortcut={() => history.push(t.to)}
            shortcutLabel={`⌥${i + 1}`}
            shortcutFilter={(e) => e.keyCode === KEYCODE_FOR_1 + i && e.altKey}
          >
            <Tab to={t.to}>
              {t.icon}
              <TabLabel>{t.label}</TabLabel>
            </Tab>
          </ShortcutHandler>
        ))}
      </div>
      <div style={{height: 20}} />
      <LeftNavRepositorySection />
      <TimezonePicker />
    </LeftNavContainer>
  );
};

const LogoWebsocketStatus = styled(WebsocketStatus)`
  position: absolute;
  top: 28px;
  left: 42px;
`;

const ItemHeader = styled.div`
  font-size: 15px;
  text-overflow: ellipsis;
  overflow: hidden;
  padding: 8px 12px;
  padding-left: 8px;
  margin-top: 10px;
  border-left: 4px solid transparent;
  border-bottom: 1px solid transparent;
  display: block;
  font-weight: bold;
  color: ${Colors.LIGHT_GRAY3} !important;
`;

const LeftNavContainer = styled.div`
  width: 235px;
  height: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: start;
  background: ${Colors.DARK_GRAY2};
  border-right: 1px solid ${Colors.DARK_GRAY5};
  padding-top: 14px;
`;

const Tab = styled(Link)`
  color: ${Colors.LIGHT_GRAY1} !important;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  display: flex;
  padding: 8px 12px;
  margin: 0px 0;
  align-items: center;
  outline: 0;
  &:hover {
    color: ${Colors.WHITE} !important;
    text-decoration: none;
  }
  &:focus {
    outline: 0;
  }
  &.selected {
    color: ${Colors.WHITE} !important;
    border-left: 4px solid ${Colors.COBALT3};
    font-weight: 600;
  }
`;

const TabLabel = styled.div`
  font-size: 13px;
  margin-left: 6px;
  text-decoration: none;
  white-space: nowrap;
  text-decoration: none;
`;

const LogoContainer = styled.div`
  width: 100%;
  padding: 0 10px;
  margin-bottom: 10px;
  position: relative;
  cursor: pointer;
  &:hover {
    img {
      filter: brightness(110%);
    }
  }
`;

const LogoMetaContainer = styled.div`
  position: absolute;
  left: 56px;
  top: -3px;
  height: 42px;
  padding-left: 4px;
  right: 0;
  z-index: 1;
  border-bottom: 1px solid ${Colors.DARK_GRAY4};
`;

const DetailLink = styled(Link)`
  color: ${Colors.DARK_GRAY3};
  text-decoration: underline;

  && :hover,
  :active,
  :visited {
    color: ${Colors.DARK_GRAY1};
  }
`;
