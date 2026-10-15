import { useRef, useState, type ReactNode } from 'react'
import { Bell, Folder, Mail, Moon, Plus, QrCode, Smartphone, Undo2, ArrowRight, Fingerprint, ChevronLeft, SlidersHorizontal } from 'lucide-react'
import { Button, IconButton, TextButton } from '../../components/Button'
import { HoldButton } from '../../components/HoldButton'
import { Chip, type ChipKind } from '../../components/Chip'
import { TextField, TextArea } from '../../components/TextField'
import { CodeInput } from '../../components/CodeInput'
import { AnswerInput, AnswerOption, AnswerOptions } from '../../components/Answer'
import { OptionGroup, OptionRow } from '../../components/OptionRow'
import { FormField } from '../../components/FormField'
import { Toggle } from '../../components/Toggle'
import { ListGroup, ListRow } from '../../components/List'
import { AgentRow } from '../../components/AgentRow'
import { InlineAlert } from '../../components/InlineAlert'
import { NumberedSteps, ProgressSteps } from '../../components/Steps'
import { ApproveAllBar, SectionTitle, SummaryCard } from '../../components/Summary'
import {
  AgentText,
  AgentTile,
  AnsweredLine,
  AskMeChip,
  Choices,
  Composer,
  ComposerInfo,
  PermissionCard,
  StatusLine,
  Suggestions,
  ToolLine,
  Typing,
  UserBubble,
} from '../../components/Chat'
import { ApprovalCard, CompactApprovalCard, QuestionCard, SessionRow } from '../../components/RequestCard'
import { BottomBar, ComputerSwitcher, HomeHeader, TabBar, TopBar } from '../../components/Bars'
import { Sheet } from '../../components/Sheet'
import { ComputerMenu } from '../../components/ComputerMenu'
import { Banner, Toast } from '../../components/Notice'
import { FaceIdSheet } from '../../components/FaceIdSheet'
import { LockNotification } from '../../components/LockNotification'
import { EmptyLine, EmptyState } from '../../components/EmptyState'
import { OverlayHostProvider } from '../../components/Overlay'
import { AgentLogo, GoogleLogo, ICON } from '../../components/icons'
import s from './Components.module.css'

const noop = () => {}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={s.section}>
      <h2 className={s.label}>{title}</h2>
      {children}
    </section>
  )
}

/** A phone-sized box with its own overlay host, so open sheets/menus render inside it. */
function DemoPhone({ height, children, overlays }: { height: number; children?: ReactNode; overlays?: ReactNode }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  return (
    <div className={s.phone} style={{ height }}>
      <div className={s.phoneContent}>{children}</div>
      <div className={s.phoneOverlays} ref={setHost} />
      {host && (
        <OverlayHostProvider host={host} content={null}>
          {overlays}
        </OverlayHostProvider>
      )}
    </div>
  )
}

const CHIPS: ChipKind[] = ['low', 'medium', 'high', 'working', 'paused', 'stopped', 'done', 'approved', 'connected', 'failed', 'denied', 'question', 'plan']

function Column({ theme }: { theme: 'dark' | 'light' }) {
  const [toggle, setToggle] = useState(true)
  const [code, setCode] = useState('482')
  const [answer, setAnswer] = useState('')
  const [pick, setPick] = useState(1)
  const switcher = useRef<HTMLDivElement>(null)

  return (
    <div className={s.col} data-theme={theme}>
      <h1 className={s.colTitle}>{theme === 'dark' ? 'Dark' : 'Light'}</h1>

      <Section title="Button">
        <div className={s.two}>
          <Button variant="secondary">Deny</Button>
          <Button icon={<Fingerprint size={18} {...ICON} />}>Approve</Button>
          <Button variant="secondary" data-demo="pressed">
            Deny
          </Button>
          <Button data-demo="pressed" icon={<Fingerprint size={18} {...ICON} />}>
            Approve
          </Button>
          <Button>Review</Button>
          <Button loading>Approve</Button>
        </div>
        <Button size="l" block>
          Sign in
        </Button>
        <Button size="l" block disabled>
          Sign in
        </Button>
        <Button size="l" block variant="secondary" icon={<GoogleLogo size={20} />}>
          Continue with Google
        </Button>
        <Button size="l" block variant="secondary" disabled>
          Not now
        </Button>
        <Button size="l" block variant="destructive">
          Sign out
        </Button>
        <Button size="l" block icon={<Mail size={20} {...ICON} />}>
          Email me the link
        </Button>
        <div className={s.row}>
          <TextButton>Forgot password?</TextButton>
          <TextButton>Resend</TextButton>
          <TextButton destructive>Remove</TextButton>
          <TextButton disabled>Retry</TextButton>
        </div>
      </Section>

      <Section title="Hold button — idle · holding · released early · done">
        <HoldButton onComplete={noop} />
        <HoldButton onComplete={noop} demoState="holding" />
        <div style={{ paddingTop: 24 }}>
          <HoldButton onComplete={noop} demoState="cancelled" />
        </div>
        <HoldButton onComplete={noop} demoState="done" />
      </Section>

      <Section title="Icon button">
        <div className={s.row}>
          <IconButton label="Settings">
            <SlidersHorizontal size={20} {...ICON} />
          </IconButton>
          <IconButton plain label="Back">
            <ChevronLeft size={28} {...ICON} />
          </IconButton>
        </div>
      </Section>

      <Section title="Chip">
        <div className={s.row}>
          {CHIPS.map((k) => (
            <Chip key={k} kind={k} />
          ))}
        </div>
      </Section>

      <Section title="Text field — default · focused · filled · error · disabled · password">
        <TextField label="Email" placeholder="you@email.com" type="email" />
        <TextField label="Email" placeholder="you@email.com" defaultValue="you@email.com" demoFocused />
        <TextField label="Email" defaultValue="you@email.com" />
        <TextField label="Password" password defaultValue="wrongpass" error="Wrong email or password." />
        <TextField label="Email" placeholder="you@email.com" disabled />
        <TextField label="Password" password placeholder="At least 8 characters" />
      </Section>

      <Section title="Code input — empty · active · filled · error">
        <CodeInput value="" onChange={noop} label="Enter the code" />
        <CodeInput value={code} onChange={setCode} label="Enter the code" demoActive />
        <CodeInput value="482917" onChange={noop} label="Enter the code" />
        <CodeInput value="000000" onChange={noop} label="Enter the code" error="This code has expired. Use the new code on your computer." />
      </Section>

      <Section title="Answer option — default · selected · sent; answer input — empty · typed · error">
        <AnswerOptions label="Which login method should I add?">
          <AnswerOption index={1} label="Email and password" selected={pick === 1} onPress={() => setPick(1)} />
          <AnswerOption index={2} label="Google sign-in" selected={pick === 2} onPress={() => setPick(2)} />
        </AnswerOptions>
        <AnswerOption index={1} label="Email and password" mode="send" sent />
        <AnswerInput value={answer} onChange={setAnswer} />
        <AnswerInput value="Use email and password" onChange={noop} />
        <AnswerInput value="" onChange={noop} placeholder="Tell the agent what to do next" />
        <AnswerInput value="" onChange={noop} error="Type an answer first." />
      </Section>

      <Section title="Option row — selected · default · disabled · with logo">
        <OptionGroup label="Safety">
          <OptionRow title="Ask me before every action" description="Safest when you’re away" selected />
          <OptionRow title="Allow file edits" description="Asks only before running commands" />
          <OptionRow title="Plan only" description="Makes a plan, changes nothing" />
        </OptionGroup>
        <OptionGroup label="Choose agent">
          <OptionRow title="Claude Code" description="Ready" selected leading={<AgentLogo agent="claude" size={24} />} />
          <OptionRow title="Codex" description="Ready" leading={<AgentLogo agent="codex" size={24} />} />
          <OptionRow title="Cursor" description="Can’t start tasks from the phone" disabled leading={<AgentLogo agent="cursor" size={24} />} />
        </OptionGroup>
      </Section>

      <Section title="Form field — value · with note · placeholder · disabled · multi-line">
        <FormField label="Computer" value="Windows PC · Awake" />
        <FormField label="Agent" value="Claude Code" note="Cursor can’t start tasks from the phone" />
        <FormField label="Project folder" placeholder="Choose a folder" />
        <FormField label="Computer" value="Mac 2" disabled />
        <TextArea label="Instruction" placeholder="What should the agent do?" />
      </Section>

      <Section title="Toggle — on · off · disabled">
        <div className={s.row}>
          <Toggle checked={toggle} onChange={setToggle} label="Keep awake" />
          <Toggle checked={false} onChange={noop} label="Off example" />
          <Toggle checked onChange={noop} label="Disabled on" disabled />
          <Toggle checked={false} onChange={noop} label="Disabled off" disabled />
        </div>
      </Section>

      <Section title="List group — navigation · toggle · value · destructive · two-line · action · numbered">
        <ListGroup header="Devices">
          <ListRow title="Paired phones" value="2" onPress={noop} />
        </ListGroup>
        <ListGroup header="Approvals">
          <ListRow title="Time to answer" value="10 min" onPress={noop} />
          <ListRow title="AI explanation" toggle={{ checked: true, onChange: noop }} />
        </ListGroup>
        <ListGroup header="Account">
          <ListRow title="you@email.com" />
          <ListRow title="Sign out" destructive onPress={noop} />
        </ListGroup>
        <ListGroup>
          <ListRow title="This phone" subtitle="iPhone · active now" leading={<Smartphone size={24} {...ICON} />} />
          <ListRow
            title="Old Android"
            subtitle="Last used yesterday"
            leading={<Smartphone size={24} {...ICON} />}
            trailing={<TextButton>Remove</TextButton>}
          />
        </ListGroup>
        <ListGroup header="On your computer">
          <ListRow number={1} title="Open the email" />
          <ListRow number={2} title="Install the helper" subtitle="Installer or terminal command" />
          <ListRow number={3} title="The helper shows a QR code" />
        </ListGroup>
        <ListGroup header="Recent">
          <ListRow monoTitle title="my-app" subtitle="C:\Users\you\projects\my-app" leading={<Folder size={24} {...ICON} />} onPress={noop} />
        </ListGroup>
      </Section>

      <Section title="Agent row — connected · disconnected · not connected">
        <ListGroup header="Windows PC · agents">
          <AgentRow agent="claude" capabilities="Approvals, questions, full control" status="connected" />
          <AgentRow agent="codex" capabilities="Reconnect on your computer" status="disconnected" />
          <AgentRow agent="cursor" capabilities="Approvals only" status="connected" />
        </ListGroup>
        <ListGroup>
          <AgentRow agent="claude" variant="setup" capabilities="Approvals, questions, full control" status="connected" />
          <AgentRow agent="cursor" variant="setup" capabilities="Approvals only" status="not-connected" />
        </ListGroup>
      </Section>

      <Section title="Inline alert — warning · error · info, with action">
        <InlineAlert kind="warning" action={{ label: 'Turn on', onPress: noop }}>
          Notifications are off. You’ll miss requests.
        </InlineAlert>
        <InlineAlert kind="error">Windows PC is offline · last seen 2 min ago</InlineAlert>
        <InlineAlert kind="info">Codex disconnected after an update. Reconnect on your computer.</InlineAlert>
        <InlineAlert kind="error" action={{ label: 'Retry', onPress: noop }}>
          Not sent: no internet connection. Nothing was sent.
        </InlineAlert>
        <InlineAlert kind="warning" action={{ label: 'Message agent', onPress: noop }}>
          Too late. This request went back to your computer.
        </InlineAlert>
        <InlineAlert kind="error">Type an answer first.</InlineAlert>
      </Section>

      <Section title="Progress step · numbered step">
        <ProgressSteps
          label="Progress"
          steps={[
            { label: 'Sent', state: 'done' },
            { label: 'Reached your computer', state: 'done' },
            { label: 'Running', state: 'current' },
          ]}
        />
        <ProgressSteps
          label="Progress"
          steps={[
            { label: 'Sent', state: 'done' },
            { label: 'Reached your computer', state: 'current' },
            { label: 'Running', state: 'pending' },
          ]}
        />
        <NumberedSteps
          steps={[
            { title: 'Install the helper on your computer', description: 'A small app that talks to your agents' },
            { title: 'Connect your agents', description: 'Claude Code, Codex, Cursor' },
            { title: 'Scan the code with this phone', description: 'Pairs your phone securely' },
          ]}
        />
      </Section>

      <Section title="Summary card · section title">
        <SummaryCard waiting={2} working={1} completed={2} />
        <SectionTitle title="Needs you" count={2} />
        <EmptyLine>You’re all caught up</EmptyLine>
      </Section>

      <Section title="Request card — approval low · medium · high · not sent">
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
        <ApprovalCard
          agent="claude"
          project="my-app"
          time="3 min ago"
          risk="medium"
          title="Install a new package"
          command="npm install jsonwebtoken@9"
          timeoutMin={10}
          onOpen={noop}
          onApprove={noop}
          onDeny={noop}
        />
        <ApprovalCard
          agent="claude"
          project="portfolio"
          time="6 min ago"
          risk="high"
          title="Force-push to main"
          command="git push --force origin main"
          timeoutMin={10}
          onOpen={noop}
          onApprove={noop}
          onDeny={noop}
        />
        <ApprovalCard
          agent="codex"
          project="api"
          time="1 min ago"
          risk="low"
          title="Install a package"
          command="npm install zod"
          timeoutMin={10}
          onOpen={noop}
          onApprove={noop}
          onDeny={noop}
          alert={{ kind: 'error', text: 'Not sent: no internet connection. Nothing was sent.', action: { label: 'Retry', onPress: noop } }}
        />
      </Section>

      <Section title="Request card — question · option sent">
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
        <QuestionCard
          agent="claude"
          project="my-app"
          time="1 min ago"
          question="How should errors be shown on the login page?"
          options={['Under each field', 'One message at the top']}
          timeoutMin={10}
          onOpen={noop}
          onAnswer={noop}
          sentIndex={0}
        />
      </Section>

      <Section title="Compact card (queue)">
        <CompactApprovalCard risk="low" title="Install a package" command="npm install zod" />
        <CompactApprovalCard risk="high" title="Delete a folder" command="rm -rf migrations/old" />
      </Section>

      <Section title="Session row — working · paused · done · failed">
        <SessionRow agent="claude" project="portfolio" time="4m" status="working" text="Editing login.js" onPress={noop} />
        <SessionRow agent="claude" project="my-app" time="18m" status="paused" text="Usage limit · continues at 3:45 pm" onPress={noop} />
        <SessionRow agent="cursor" project="site" time="10:42" status="done" text="Added the contact form" onPress={noop} />
        <SessionRow agent="codex" project="docs" time="09:15" status="failed" text="2 tests failed, so it stopped" onPress={noop} />
      </Section>

      <Section title="Home header · switcher — awake · asleep · offline">
        <HomeHeader onSettings={noop} />
        <div className={s.stack}>
          <div>
            <ComputerSwitcher name="Windows PC" state="awake" tone="green" expanded={false} onPress={noop} />
          </div>
          <div>
            <ComputerSwitcher name="MacBook" state="asleep" tone="amber" expanded={false} onPress={noop} />
          </div>
          <div>
            <ComputerSwitcher name="Windows PC" state="offline" tone="grey" expanded={false} onPress={noop} />
          </div>
        </div>
      </Section>

      <Section title="Top bar — title · agent + count">
        <div className={s.bars} style={{ ['--safe-top' as string]: '0px' }}>
          <TopBar title="Settings" onBack={noop} />
          <TopBar title="Claude Code · my-app" agent="claude" end="1 of 3" onBack={noop} />
          <TopBar onBack={noop} />
        </div>
      </Section>

      <Section title="Bottom bar — one · two · stacked">
        <div className={s.barBox}>
          <BottomBar>
            <Button size="l" icon={<QrCode size={20} {...ICON} />}>
              Scan the code
            </Button>
          </BottomBar>
        </div>
        <div className={s.barBox}>
          <BottomBar layout="two">
            <Button size="l" variant="secondary">
              Deny
            </Button>
            <Button size="l" icon={<Fingerprint size={20} {...ICON} />}>
              Approve
            </Button>
          </BottomBar>
        </div>
        <div className={s.barBox}>
          <BottomBar layout="two">
            <Button size="l" variant="secondary">
              Deny
            </Button>
            <HoldButton onComplete={noop} />
          </BottomBar>
        </div>
        <div className={s.barBox}>
          <BottomBar layout="stacked">
            <Button size="l" icon={<Bell size={20} {...ICON} />}>
              Turn on notifications
            </Button>
            <Button size="l" variant="secondary">
              Not now
            </Button>
          </BottomBar>
        </div>
        <div className={s.barBox}>
          <BottomBar layout="two">
            <Button size="l" variant="secondary">
              Answer later
            </Button>
            <Button size="l" icon={<ArrowRight size={20} {...ICON} />}>
              Send answer
            </Button>
          </BottomBar>
        </div>
        <div className={s.barBox}>
          <BottomBar>
            <Button size="l" icon={<Undo2 size={20} {...ICON} />}>
              Restore files to this point
            </Button>
          </BottomBar>
        </div>
      </Section>

      <Section title="Chat (09-chat-and-tasks.md) — your message · agent turn · tool line · status · typing">
        <div className={s.stack}>
          <UserBubble text="Clean up the build and get the login page ready." note="Ask me before every action" />
          <AgentText agent="claude">On it. I’ll update the login page first, then clean up the old build.</AgentText>
          <ToolLine summary="Read 5 files, edited 3" steps={['Read 5 files', 'Updated LoginForm.tsx', 'Updated login.css', 'Updated routes.ts']} />
          <AnsweredLine ok text="You approved · rm -rf dist" />
          <AnsweredLine ok={false} text="You denied · rm -rf dist" />
          <StatusLine icon="done" text="Finished · 10:42" />
          <StatusLine icon="paused" text="Paused · Windows PC went offline" />
          <Typing agent="claude" />
        </div>
      </Section>

      <Section title="Permission card — low · high (Hold to approve + risk line) · not sent">
        <div className={s.stack}>
          <PermissionCard agent="claude" risk="low" title="Delete the old build folder" command="rm -rf dist" back="back to PC in 8 min" onApprove={noop} onDeny={noop} />
          <PermissionCard
            agent="claude"
            risk="high"
            title="Force-push to main"
            command="git push --force origin main"
            back="back to PC in 4 min"
            warning="Other people’s recent changes on main could be lost."
            onApprove={noop}
            onDeny={noop}
          />
          <PermissionCard
            agent="codex"
            risk="medium"
            title="Change config file"
            command="edit .env.example"
            back="back to PC in 6 min"
            alert={{ kind: 'error', text: 'Not sent: no internet connection. Nothing was sent.', action: { label: 'Retry', onPress: noop } }}
            onApprove={noop}
            onDeny={noop}
          />
        </div>
      </Section>

      <Section title="Answer choices · suggested replies">
        <div className={s.stack}>
          <Choices label="Which login method should I add?" options={['Email and password', 'Google sign-in']} note="Or type your own answer below · back to PC in 6 min" onPick={noop} />
          <Suggestions options={['Yes, run the tests', 'Not now']} onPick={noop} />
        </div>
      </Section>

      <Section title="Composer — empty · with Ask me chip · Cursor info line">
        <div className={s.stack}>
          <Composer placeholder="Reply to Claude Code…" value="" onChange={noop} onSend={noop} onPlus={noop} />
          <Composer placeholder="Message Claude Code…" value="Add a dark mode" onChange={noop} onSend={noop} onPlus={noop} chip={<AskMeChip label="Ask every action" onPress={noop} />} />
          <ComposerInfo>Cursor runs in its editor. You can approve its requests here.</ComposerInfo>
        </div>
      </Section>

      <Section title="Agent tile — ready · disabled · Approve all bar">
        <div className={s.row}>
          <AgentTile agent="claude" status="Ready" onPress={noop} />
          <AgentTile agent="codex" status="Ready" onPress={noop} />
          <AgentTile agent="cursor" status="Start in Cursor" disabled onPress={noop} />
        </div>
        <ApproveAllBar count={3} onApprove={noop} />
      </Section>

      <Section title="Tab bar — content scrolls under it">
        <DemoPhone height={300}>
          <div className={s.stack} style={{ paddingTop: 16 }}>
            <SessionRow agent="claude" project="portfolio" time="4m" status="working" text="Editing login.js" onPress={noop} />
            <SessionRow agent="cursor" project="site" time="10:42" status="done" text="Added the contact form" onPress={noop} />
            <SessionRow agent="codex" project="docs" time="09:15" status="failed" text="2 tests failed, so it stopped" onPress={noop} />
          </div>
          <TabBar />
        </DemoPhone>
      </Section>

      <Section title="Computer menu">
        <DemoPhone
          height={480}
          overlays={
            <ComputerMenu
              open
              inline
              onClose={noop}
              anchor={switcher}
              currentId="win"
              computers={[
                { id: 'win', name: 'Windows PC', status: 'Awake · 3 sessions', tone: 'green' },
                { id: 'mac', name: 'MacBook', status: 'Asleep', tone: 'amber' },
                { id: 'mac2', name: 'Mac 2', status: 'Offline · last seen 1 day ago', tone: 'grey' },
              ]}
              onPick={noop}
              onAdd={noop}
            />
          }
        >
          <HomeHeader onSettings={noop} />
          <div ref={switcher} style={{ display: 'inline-block' }}>
            <ComputerSwitcher name="Windows PC" state="awake" tone="green" expanded onPress={noop} />
          </div>
        </DemoPhone>
      </Section>

      <Section title="Bottom sheet — confirm · picker">
        <DemoPhone
          height={520}
          overlays={
            <Sheet
              open
              inline
              onClose={noop}
              icon={<Moon size={24} {...ICON} />}
              title="Keep Windows PC awake while agents work?"
              body="This stops your computer from going to sleep on its own, so sessions don’t drop."
              note="Closing the laptop lid or pressing the power button will still put it to sleep."
              actions={
                <>
                  <Button size="l" block>
                    Keep awake
                  </Button>
                  <Button size="l" block variant="secondary">
                    Not now
                  </Button>
                </>
              }
              footnote="You can change this anytime in Agents."
            />
          }
        />
        <DemoPhone
          height={460}
          overlays={
            <Sheet open inline onClose={noop} title="Intensity" description="How much the agent thinks before acting.">
              <OptionGroup label="Intensity">
                <OptionRow title="Low" description="Faster, uses less" />
                <OptionRow title="Medium" description="Balanced" selected />
                <OptionRow title="High" description="Slower, more careful" />
              </OptionGroup>
            </Sheet>
          }
        />
        <DemoPhone
          height={360}
          overlays={
            <Sheet
              open
              inline
              onClose={noop}
              title="Sign out?"
              body="You won’t get requests on this phone until you sign in again. Your agents keep working."
              actions={
                <>
                  <Button size="l" block variant="destructive">
                    Sign out
                  </Button>
                  <Button size="l" block variant="secondary">
                    Cancel
                  </Button>
                </>
              }
            />
          }
        />
      </Section>

      <Section title="Face ID sheet — scanning · success">
        <DemoPhone height={300} overlays={<FaceIdSheet open demoState="scanning" onSuccess={noop} onCancel={noop} />} />
        <DemoPhone height={300} overlays={<FaceIdSheet open demoState="success" onSuccess={noop} onCancel={noop} />} />
      </Section>

      <Section title="In-app banner — request · not sent · toast">
        <DemoPhone
          height={260}
          overlays={
            <>
              <Banner
                open
                autoHideMs={0}
                onDismiss={noop}
                agent="claude"
                text="Claude Code needs your approval"
                action={{ label: 'Review', onPress: noop }}
              />
              <Toast open autoHideMs={0} onDismiss={noop} action={{ label: 'Undo', onPress: noop }} bottom="16px">
                Denied
              </Toast>
            </>
          }
        />
        <DemoPhone
          height={220}
          overlays={
            <>
              <Banner
                open
                autoHideMs={0}
                onDismiss={noop}
                kind="not-sent"
                text="Not sent: no internet connection. Nothing was sent."
                action={{ label: 'Retry', onPress: noop }}
              />
              <Toast open autoHideMs={0} onDismiss={noop} success bottom="16px">
                Approved · running
              </Toast>
            </>
          }
        />
      </Section>

      <Section title="Lock-screen notification · in-app preview">
        <div className={s.lockWall}>
          <LockNotification
            time="now"
            title="Claude Code · my-app"
            body="Wants to delete old build files"
            chip="low"
            hint="Approve needs Face ID"
            buttons={[
              { label: 'Approve', onPress: noop, fingerprint: true },
              { label: 'Deny', onPress: noop },
              { label: 'Open', onPress: noop },
            ]}
          />
          <LockNotification time="1m" title="Claude Code · portfolio" body="Wants to force-push to main" chip="high" hint="git push --force origin main" monoHint buttons={[{ label: 'Open', onPress: noop }, { label: 'Deny', onPress: noop }]} />
          <LockNotification time="3m" title="Codex · api" body="3 requests waiting" hint="Tap to review them one by one." onOpen={noop} />
        </div>
        <LockNotification
          surface="app"
          time="now"
          title="Claude Code · my-app"
          body="Wants to delete old build files"
          chip="low"
          buttons={[
            { label: 'Approve', onPress: noop, primary: true, fingerprint: true },
            { label: 'Deny', onPress: noop },
            { label: 'Open', onPress: noop },
          ]}
        />
      </Section>

      <Section title="Empty · loading">
        <EmptyState
          title="No sessions yet"
          body="Start a task here, or start one on your computer and it will show up."
          action={<Button icon={<Plus size={20} {...ICON} />}>New task</Button>}
        />
        <EmptyState
          kind="loading"
          title="Connecting to your computer…"
          body="Keep the helper open on your computer."
          action={<TextButton>Cancel</TextButton>}
        />
      </Section>
    </div>
  )
}

/** Hidden developer route: every component in every state, dark and light side by side. */
export function Components() {
  return (
    <main className={s.page}>
      <div className={s.cols}>
        <Column theme="dark" />
        <Column theme="light" />
      </div>
    </main>
  )
}
