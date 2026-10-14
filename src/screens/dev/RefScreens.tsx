import { useRef, useState, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { ArrowRight, Laptop, Plus } from 'lucide-react'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { CodeInput } from '../../components/CodeInput'
import { ListGroup, ListRow } from '../../components/List'
import { AgentRow } from '../../components/AgentRow'
import { OptionGroup, OptionRow } from '../../components/OptionRow'
import { ProgressSteps } from '../../components/Steps'
import { SectionTitle, SummaryCard } from '../../components/Summary'
import { ApprovalCard, CommandBox, QuestionCard, SessionRow } from '../../components/RequestCard'
import { BottomBar, ComputerSwitcher, HomeHeader, TabBar, TabSpacer, TopBar } from '../../components/Bars'
import { Sheet } from '../../components/Sheet'
import { ComputerMenu } from '../../components/ComputerMenu'
import { ICON } from '../../components/icons'
import s from './RefScreens.module.css'

const noop = () => {}

function Screen({ children }: { children: ReactNode }) {
  return <div className={s.screen}>{children}</div>
}

function HomeTop({ menu }: { menu?: boolean }) {
  const pill = useRef<HTMLDivElement>(null)
  return (
    <Screen>
      <HomeHeader onSettings={noop} />
      <div ref={pill} style={{ alignSelf: 'flex-start' }}>
        <ComputerSwitcher name="Windows PC" state="awake" tone="green" expanded={!!menu} onPress={noop} />
      </div>
      <div style={{ marginTop: 'var(--space-6)' }}>
        <SummaryCard waiting={2} working={1} completed={2} />
      </div>
      <SectionTitle title="Needs you" count={2} />
      <div className={s.stack}>
        <ApprovalCard
          agent="claude"
          project="my-app"
          time="2 min ago"
          risk="low"
          title="Delete the old build folder"
          command="rm -rf dist"
          timeoutMin={10}
          onOpen={noop}
          onApprove={noop}
          onDeny={noop}
        />
        <QuestionCard
          agent="codex"
          project="api"
          time="5 min ago"
          question="Which login method should I add?"
          options={['Email and password', 'Google sign-in']}
          timeoutMin={10}
          onOpen={noop}
          onAnswer={noop}
        />
      </div>
      <TabSpacer />
      <TabBar active="home" />
      {menu && (
        <ComputerMenu
          open
          inline
          onClose={noop}
          anchor={pill}
          currentId="win"
          computers={[
            { id: 'win', name: 'Windows PC', status: 'Awake · 3 sessions', tone: 'green' },
            { id: 'mac', name: 'MacBook', status: 'Asleep', tone: 'amber' },
            { id: 'mac2', name: 'Mac 2', status: 'Offline · last seen 1 day ago', tone: 'grey' },
          ]}
          onPick={noop}
          onAdd={noop}
        />
      )}
    </Screen>
  )
}

function HomeScrolled() {
  return (
    <Screen>
      <h1 className="sr-only">Nudge</h1>
      <SectionTitle title="Working" count={1} />
      <SessionRow agent="claude" project="portfolio" time="4m" status="working" text="Editing login.js" onPress={noop} />
      <SectionTitle title="Completed today" count={2} />
      <div className={s.stack}>
        <SessionRow agent="cursor" project="site" time="10:42" status="done" text="Added the contact form" onPress={noop} />
        <SessionRow agent="codex" project="docs" time="09:15" status="failed" text="2 tests failed, so it stopped" onPress={noop} />
      </div>
      <p className={s.after} style={{ font: 'var(--t-footnote)', color: 'var(--ink-2)' }}>
        Completed sessions clear after 24 hours
      </p>
      <TabSpacer />
      <TabBar active="home" />
    </Screen>
  )
}

function Settings({ sheet }: { sheet?: boolean }) {
  return (
    <Screen>
      <TopBar title="Settings" onBack={noop} heading />
      <div className={s.groups}>
        <ListGroup header="Devices">
          <ListRow title="Paired phones" value="2" onPress={noop} />
        </ListGroup>
        <ListGroup header="Approvals">
          <ListRow title="Time to answer" value="10 min" onPress={noop} />
          <ListRow title="AI explanation" toggle={{ checked: true, onChange: noop }} />
        </ListGroup>
        <ListGroup header="Notifications">
          <ListRow title="Task finished" toggle={{ checked: true, onChange: noop }} />
          <ListRow title="Task failed" toggle={{ checked: true, onChange: noop }} />
        </ListGroup>
        <ListGroup header="Appearance">
          <ListRow title="Dark mode" toggle={{ checked: true, onChange: noop }} />
        </ListGroup>
        <ListGroup header="Account">
          <ListRow title="you@email.com" />
          <ListRow title="Sign out" destructive onPress={noop} />
        </ListGroup>
      </div>
      {sheet && (
        <Sheet open inline onClose={noop} title="Time to answer" description="If you don’t answer in time, the request goes back to your computer.">
          <OptionGroup label="Time to answer">
            <OptionRow title="5 minutes" />
            <OptionRow title="10 minutes" description="Default" selected />
            <OptionRow title="15 minutes" />
            <OptionRow title="30 minutes" />
          </OptionGroup>
        </Sheet>
      )}
    </Screen>
  )
}

function ModelPicker() {
  return (
    <Screen>
      <TopBar title="Claude Code · portfolio" agent="claude" onBack={noop} />
      <Sheet open inline onClose={noop} title="Model" description="Applies from the agent’s next step.">
        <OptionGroup label="Model">
          <OptionRow title="Default" description="Set on your computer" selected />
          <OptionRow title="[Model name]" description="[Short description]" />
          <OptionRow title="[Model name]" description="[Short description]" />
        </OptionGroup>
      </Sheet>
    </Screen>
  )
}

function Agents() {
  const [awake, setAwake] = useState(true)
  return (
    <Screen>
      <h1 className={s.largeTitle}>Agents</h1>
      <div className={s.groups} style={{ paddingTop: 'var(--space-6)' }}>
        <ListGroup>
          <ListRow title="Windows PC" subtitle="Awake · keep awake" leading={<Laptop size={24} {...ICON} />} toggle={{ checked: awake, onChange: setAwake }} />
        </ListGroup>
        <ListGroup header="Windows PC · agents">
          <AgentRow agent="claude" capabilities="Approvals, questions, full control" status="connected" />
          <AgentRow agent="codex" capabilities="Reconnect on your computer" status="disconnected" />
          <AgentRow agent="cursor" capabilities="Approvals only" status="connected" />
        </ListGroup>
        <ListGroup header="MacBook · asleep">
          <AgentRow agent="claude" capabilities="Approvals, questions, full control" status="connected" />
        </ListGroup>
      </div>
      <div style={{ marginTop: 'var(--space-5)' }}>
        <Button variant="secondary" block icon={<Plus size={20} {...ICON} />}>
          Add a computer
        </Button>
      </div>
      <TabSpacer />
      <TabBar active="agents" />
    </Screen>
  )
}

function ApprovalSent() {
  return (
    <Screen>
      <TopBar title="Claude Code · my-app" agent="claude" onBack={noop} />
      <Chip kind="approved" className={s.detailChip} />
      <h1 className={s.title2}>Delete the old build folder</h1>
      <CommandBox className={s.command}>rm -rf dist</CommandBox>
      <div className={s.progress}>
        <ProgressSteps
          label="Progress"
          steps={[
            { label: 'Sent', state: 'done' },
            { label: 'Reached your computer', state: 'done' },
            { label: 'Running', state: 'current' },
          ]}
        />
      </div>
      <div className={s.blank} />
      <BottomBar layout="two">
        <Button size="l" variant="secondary">
          Back to Home
        </Button>
        <Button size="l" icon={<ArrowRight size={20} {...ICON} />}>
          Next request (2 of 3)
        </Button>
      </BottomBar>
    </Screen>
  )
}

function EnterCode() {
  return (
    <Screen>
      <TopBar title="Nudge" onBack={noop} />
      <h1 className={s.largeTitle} style={{ marginTop: 'var(--space-3)' }}>
        Enter the code
      </h1>
      <p className={s.lead}>Type the 6-digit code shown in the helper on your computer.</p>
      <div className={s.code}>
        <CodeInput value="000000" onChange={noop} label="Enter the code" error="This code has expired. Use the new code on your computer." />
      </div>
      <div className={s.blank} />
      <BottomBar>
        <Button size="l">Connect</Button>
      </BottomBar>
    </Screen>
  )
}

const SCREENS: Record<string, () => ReactNode> = {
  Home: () => <HomeTop />,
  ComputerSwitcher: () => <HomeTop menu />,
  HomeScrolled: () => <HomeScrolled />,
  Settings: () => <Settings />,
  TimeoutPicker: () => <Settings sheet />,
  ModelPicker: () => <ModelPicker />,
  Agents: () => <Agents />,
  ApprovalSent: () => <ApprovalSent />,
  EnterCode: () => <EnterCode />,
}

export const REF_NAMES = Object.keys(SCREENS)

export function RefScreens() {
  const { name = 'Home' } = useParams()
  const render = SCREENS[name]
  return render ? <>{render()}</> : <Screen>{null}</Screen>
}
