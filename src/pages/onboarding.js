import { navigate } from '/src/utils/router.js'
import { createIcon } from '/src/utils/icons.js'
import { Dumbbell } from 'lucide'

function render() {
  const section = document.createElement('section')
  section.className = 'page onboarding-page'

  const content = document.createElement('div')
  content.className = 'onboarding-content'

  const iconWrap = document.createElement('div')
  iconWrap.className = 'onboarding-icon'
  iconWrap.appendChild(createIcon(Dumbbell, 40, 1.5))
  content.appendChild(iconWrap)

  const title = document.createElement('h1')
  title.className = 'onboarding-title'
  title.textContent = 'Benvenuto su FitTrack'
  content.appendChild(title)

  const text = document.createElement('p')
  text.className = 'onboarding-text'
  text.textContent = 'Imposta i tuoi obiettivi e inizia il tuo percorso fitness.'
  content.appendChild(text)

  const weightGroup = document.createElement('div')
  weightGroup.className = 'input-group'
  weightGroup.style.cssText = 'width:100%'
  weightGroup.innerHTML = '<label for="weight">Peso (kg)</label><input type="number" id="weight" class="input" placeholder="70" />'
  content.appendChild(weightGroup)

  const heightGroup = document.createElement('div')
  heightGroup.className = 'input-group'
  heightGroup.style.cssText = 'width:100%'
  heightGroup.innerHTML = '<label for="height">Altezza (cm)</label><input type="number" id="height" class="input" placeholder="175" />'
  content.appendChild(heightGroup)

  const startBtn = document.createElement('button')
  startBtn.className = 'btn btn-primary btn-full'
  startBtn.textContent = 'Inizia Allenamento'
  startBtn.addEventListener('click', () => navigate('/'))
  content.appendChild(startBtn)

  section.appendChild(content)
  return section
}

export { render }
export default render
