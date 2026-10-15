import { useNavigate } from 'react-router-dom'
import { QrCode } from 'lucide-react'
import { Screen } from '../Screen'
import s from '../Screen.module.css'
import { BottomBar, TopBar } from '../../components/Bars'
import { Button } from '../../components/Button'
import { NumberedSteps } from '../../components/Steps'
import { ICON } from '../../components/icons'

/** AddComputer — /computers/add (02-home.md; built in dark from the light reference's layout). */
export function AddComputer() {
  const navigate = useNavigate()
  return (
    <Screen>
      <TopBar title="Add a computer" onBack={() => navigate(-1)} />
      <h1 className={s.largeTitle}>Add another computer</h1>
      <p className={s.lead}>Same steps as before, on the new computer.</p>
      <div className={s.section}>
        <NumberedSteps
          steps={[
            { title: 'Install the helper', description: 'On the new computer' },
            { title: 'Connect its agents', description: 'Tap Yes for each one' },
            { title: 'Scan its code', description: 'With this phone' },
          ]}
        />
      </div>
      <div className={s.fill} />
      <BottomBar layout="two">
        <Button size="l" variant="secondary" onClick={() => navigate('/setup/link-sent?from=add')}>
          Email me the link
        </Button>
        <Button size="l" icon={<QrCode size={20} {...ICON} />} onClick={() => navigate('/setup/scan?from=add')}>
          Scan the code
        </Button>
      </BottomBar>
    </Screen>
  )
}
