import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Code2, Cpu, Eye, Sparkles } from 'lucide-react'

interface PhotoSlotProps {
  className?: string
}

type CameraPreset = 'studio' | 'screen' | 'front'

const PRESETS: Record<CameraPreset, { theta: number; phi: number; radius: number }> = {
  studio: { theta: 0.62, phi: 0.42, radius: 2.85 },
  screen: { theta: 2.42, phi: 0.48, radius: 2.18 },
  front: { theta: 0.06, phi: 0.35, radius: 2.78 },
}

const CODE_LINES = [
  'const profile = await loadMunicipalDigitalProfile();',
  'SELECT roads, health_facilities, public_buildings',
  '  FROM municipal_resources WHERE validated = true;',
  'const requirements = analyzeUserNeeds(workflows);',
  'export function validateRecords(data: Resource[]) {',
  '  return data.map(checkDataQuality);',
  '}',
  '// School management · testing · documentation',
  'await deployCustomizedSystem();',
]

function solveTwoBoneIK(
  shoulder: THREE.Vector3,
  hand: THREE.Vector3,
  poleDir: THREE.Vector3,
  l1: number,
  l2: number,
  outElbow: THREE.Vector3
) {
  const diff = new THREE.Vector3().subVectors(hand, shoulder)
  const rawDist = diff.length()
  const maxReach = l1 + l2 - 0.008
  const d = THREE.MathUtils.clamp(rawDist, 0.14, maxReach)
  const dir = diff.normalize()

  const cosAngle = THREE.MathUtils.clamp(
    (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d),
    -1,
    1
  )
  const sinAngle = Math.sqrt(Math.max(0, 1 - cosAngle * cosAngle))

  const orthoPole = poleDir
    .clone()
    .sub(dir.clone().multiplyScalar(poleDir.dot(dir)))
    .normalize()

  outElbow
    .copy(shoulder)
    .addScaledVector(dir, l1 * cosAngle)
    .addScaledVector(orthoPole, l1 * sinAngle)
}

const UP_AXIS = new THREE.Vector3(0, 1, 0)

function alignLimb(mesh: THREE.Object3D, start: THREE.Vector3, end: THREE.Vector3) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
  const dir = new THREE.Vector3().subVectors(end, start)
  const len = Math.max(dir.length(), 0.001)
  mesh.position.copy(mid)
  mesh.quaternion.setFromUnitVectors(UP_AXIS, dir.normalize())
  mesh.scale.set(1, len, 1)
}

export default function PhotoSlot({ className = '' }: PhotoSlotProps) {
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [preset, setPreset] = useState<CameraPreset>('studio')
  const [turbo, setTurbo] = useState(false)

  const targetOrbitRef = useRef({ ...PRESETS.studio })
  const turboRef = useRef(turbo)

  useEffect(() => {
    targetOrbitRef.current = { ...PRESETS[preset] }
  }, [preset])

  useEffect(() => {
    turboRef.current = turbo
  }, [turbo])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const scene = new THREE.Scene()

    const width = container.clientWidth || 460
    const height = container.clientHeight || 390

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 30)
    const lookTarget = new THREE.Vector3(0, 0.25, -0.08)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    container.appendChild(renderer.domElement)

    // Lighting rig
    const hemiLight = new THREE.HemisphereLight(0xf0e4c9, 0x626578, 1.05)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xf0e4c9, 1.35)
    keyLight.position.set(2.8, 3.8, 2.6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    keyLight.shadow.bias = -0.0005
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xf0e4c9, 0.85)
    rimLight.position.set(-2.6, 2.2, -2.2)
    scene.add(rimLight)

    const warmFill = new THREE.PointLight(0xf0e4c9, 0.4, 5)
    warmFill.position.set(1.8, 1.3, -1.2)
    scene.add(warmFill)

    const screenGlow = new THREE.PointLight(0xf0e4c9, 0.85, 2.4)
    screenGlow.position.set(0, 0.26, 0.02)
    scene.add(screenGlow)

    // Live 2D Canvas Texture for Laptop IDE + Floating Holographic Code Display
    const screenCanvas = document.createElement('canvas')
    screenCanvas.width = 512
    screenCanvas.height = 320
    const ctx = screenCanvas.getContext('2d')!
    const screenTexture = new THREE.CanvasTexture(screenCanvas)
    screenTexture.colorSpace = THREE.SRGBColorSpace

    function drawCodeScreen(time: number, isTurbo: boolean) {
      ctx.fillStyle = '#101017'
      ctx.fillRect(0, 0, 512, 320)

      // Top IDE titlebar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.055)'
      ctx.fillRect(0, 0, 512, 34)

      const dots = ['#626578', '#F0E4C9', '#8b8b96']
      dots.forEach((c, idx) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(18 + idx * 16, 17, 5, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.fillStyle = '#e8e6e0'
      ctx.font = 'bold 13px monospace'
      ctx.fillText('nischay.dev · municipal_systems.ts', 78, 21)

      ctx.fillStyle = isTurbo ? '#F0E4C9' : '#8b8b96'
      ctx.fillText(isTurbo ? '● TURBO' : '● LIVE', 424, 21)

      // Line numbers gutter
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)'
      ctx.fillRect(0, 34, 42, 246)

      const speed = isTurbo ? 26 : 11
      const totalChars = Math.floor(time * speed)
      const cycle = 310
      const cursorStep = totalChars % cycle

      let remaining = cursorStep + 95
      ctx.font = '14px monospace'

      CODE_LINES.forEach((line, row) => {
        const y = 62 + row * 27
        ctx.fillStyle = '#4d4d58'
        ctx.fillText(String(row + 1).padStart(2, '0'), 11, y)

        const visibleCount = Math.max(0, Math.min(line.length, remaining))
        remaining -= line.length
        const sub = line.slice(0, visibleCount)

        if (line.startsWith('//')) {
          ctx.fillStyle = '#8b8b96'
        } else if (line.startsWith('SELECT') || line.includes('WHERE')) {
          ctx.fillStyle = '#F0E4C9'
        } else if (line.includes('const') || line.includes('export') || line.includes('await')) {
          ctx.fillStyle = '#d5d2de'
        } else {
          ctx.fillStyle = '#b6b6c0'
        }
        ctx.fillText(sub, 52, y)

        if (visibleCount > 0 && visibleCount < line.length && Math.sin(time * 9) > -0.2) {
          const w = ctx.measureText(sub).width
          ctx.fillStyle = '#F0E4C9'
          ctx.fillRect(54 + w, y - 13, 8, 16)
        }
      })

      // Bottom status bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.055)'
      ctx.fillRect(0, 282, 512, 38)
      ctx.fillStyle = '#8b8b96'
      ctx.font = 'bold 12px monospace'
      ctx.fillText('MUNICIPAL GIS · DATA VALIDATION · SOFTWARE DELIVERY', 16, 305)

      screenTexture.needsUpdate = true
    }

    // Root scene group
    const world = new THREE.Group()
    scene.add(world)

    // Materials — dark theme, cream accents
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x191921,
      roughness: 0.42,
      metalness: 0.4,
    })
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x24242d,
      roughness: 0.34,
      metalness: 0.7,
    })
    const laptopMetalMat = new THREE.MeshStandardMaterial({
      color: 0x2d2d37,
      roughness: 0.3,
      metalness: 0.66,
    })
    const creamGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf0e4c9,
      emissive: 0xf0e4c9,
      emissiveIntensity: 0.42,
      roughness: 0.25,
    })
    const softCreamGlowMat = new THREE.MeshStandardMaterial({
      color: 0xf0e4c9,
      emissive: 0xf0e4c9,
      emissiveIntensity: 0.32,
      roughness: 0.25,
    })
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xe3bd94,
      roughness: 0.66,
      metalness: 0.03,
    })
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x14141b,
      roughness: 0.75,
      metalness: 0.08,
    })
    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x22222b,
      roughness: 0.8,
      metalness: 0.06,
    })
    const pantsMat = new THREE.MeshStandardMaterial({
      color: 0x16161d,
      roughness: 0.88,
    })
    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e26,
      roughness: 0.6,
      metalness: 0.22,
    })

    // Floor ambient halo disc
    const floorHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.92, 0.96, 64),
      new THREE.MeshBasicMaterial({
        color: 0xf0e4c9,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
      })
    )
    floorHalo.rotation.x = -Math.PI / 2
    floorHalo.position.set(0, -0.81, -0.1)
    world.add(floorHalo)

    const floorDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 48),
      new THREE.MeshStandardMaterial({
        color: 0x0d0d12,
        roughness: 0.9,
        transparent: true,
        opacity: 0.75,
      })
    )
    floorDisc.rotation.x = -Math.PI / 2
    floorDisc.position.set(0, -0.815, -0.1)
    floorDisc.receiveShadow = true
    world.add(floorDisc)

    // Cyber Desk (top surface cleanly at y = 0)
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.26, 0.08, 1.02), deskMat)
    deskTop.position.set(0, -0.04, 0.14)
    deskTop.castShadow = true
    deskTop.receiveShadow = true
    world.add(deskTop)

    const deskTrim = new THREE.Mesh(new THREE.BoxGeometry(2.285, 0.015, 1.045), creamGlowMat)
    deskTrim.position.set(0, -0.04, 0.14)
    world.add(deskTrim)

    // Desk legs
    const legGeo = new THREE.CylinderGeometry(0.032, 0.026, 0.74, 14)
    ;[
      [-0.98, -0.45, -0.26],
      [0.98, -0.45, -0.26],
      [-0.98, -0.45, 0.54],
      [0.98, -0.45, 0.54],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, darkMetalMat)
      leg.position.set(lx, ly, lz)
      world.add(leg)
    })

    // Ergonomic Developer Chair (at z = -0.56)
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.56), chairMat)
    chairSeat.position.set(0, -0.26, -0.56)
    chairSeat.castShadow = true
    world.add(chairSeat)

    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.68, 0.075), chairMat)
    chairBack.position.set(0, 0.14, -0.84)
    chairBack.rotation.x = -0.1
    chairBack.castShadow = true
    world.add(chairBack)

    const chairSpine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.48, 0.02), creamGlowMat)
    chairSpine.position.set(0, 0.16, -0.885)
    chairSpine.rotation.x = -0.1
    world.add(chairSpine)

    const chairPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.52, 14),
      darkMetalMat
    )
    chairPost.position.set(0, -0.55, -0.56)
    world.add(chairPost)

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.025, 0.34), darkMetalMat)
      spoke.position.set(
        Math.sin(angle) * 0.16,
        -0.79,
        -0.56 + Math.cos(angle) * 0.16
      )
      spoke.rotation.y = angle
      world.add(spoke)
    }

    // Open 3D Laptop on Desk
    const laptopGroup = new THREE.Group()
    laptopGroup.position.set(0, 0.0, 0.03)
    world.add(laptopGroup)

    const laptopBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.024, 0.42),
      laptopMetalMat
    )
    laptopBase.position.set(0, 0.012, 0)
    laptopBase.castShadow = true
    laptopBase.receiveShadow = true
    laptopGroup.add(laptopBase)

    // Recessed dark keyboard well + trackpad
    const keyWell = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.006, 0.23),
      new THREE.MeshStandardMaterial({ color: 0x101016, roughness: 0.75 })
    )
    keyWell.position.set(0, 0.025, 0.045)
    laptopGroup.add(keyWell)

    const trackpad = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.004, 0.105),
      new THREE.MeshStandardMaterial({ color: 0x34343f, roughness: 0.28, metalness: 0.6 })
    )
    trackpad.position.set(0, 0.025, -0.13)
    laptopGroup.add(trackpad)

    // Individual backlit laptop keys
    const keyMeshes: THREE.Mesh[] = []
    const keyGeo = new THREE.BoxGeometry(0.042, 0.01, 0.036)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 10; c++) {
        const kMat = new THREE.MeshStandardMaterial({
          color: 0x1d1d25,
          emissive: 0xf0e4c9,
          emissiveIntensity: 0.12,
          roughness: 0.4,
        })
        const key = new THREE.Mesh(keyGeo, kMat)
        key.position.set(-0.225 + c * 0.05, 0.029, -0.035 + r * 0.05)
        laptopGroup.add(key)
        keyMeshes.push(key)
      }
    }

    // Laptop Lid hinged at z = +0.21 opening back toward +z so inner screen faces character (-z)
    const lidPivot = new THREE.Group()
    lidPivot.position.set(0, 0.024, 0.21)
    lidPivot.rotation.x = 0.28
    laptopGroup.add(lidPivot)

    const lidShell = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.39, 0.016),
      laptopMetalMat
    )
    lidShell.position.set(0, 0.195, 0)
    lidShell.castShadow = true
    lidPivot.add(lidShell)

    // Inner glowing laptop IDE screen facing character (-z)
    const innerScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.575, 0.345),
      new THREE.MeshBasicMaterial({ map: screenTexture })
    )
    innerScreen.position.set(0, 0.195, -0.009)
    innerScreen.rotation.y = Math.PI
    lidPivot.add(innerScreen)

    // Outer laptop back-cover glowing NM diamond emblem (faces +z camera!)
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.038, 0.052, 6),
      creamGlowMat
    )
    outerRing.position.set(0, 0.2, 0.0095)
    lidPivot.add(outerRing)

    const outerCore = new THREE.Mesh(new THREE.CircleGeometry(0.02, 6), softCreamGlowMat)
    outerCore.position.set(0, 0.2, 0.01)
    lidPivot.add(outerCore)

    // Secondary Angled Code Monitor on Sleek Desk Stand beside Laptop
    const monitorStandPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 0.34, 14),
      darkMetalMat
    )
    monitorStandPost.position.set(-0.72, 0.17, -0.05)
    world.add(monitorStandPost)

    const monitorBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.1, 0.014, 20),
      darkMetalMat
    )
    monitorBase.position.set(-0.72, 0.007, -0.05)
    world.add(monitorBase)

    const holoGroup = new THREE.Group()
    holoGroup.position.set(-0.64, 0.31, -0.02)
    holoGroup.rotation.y = 0.56
    world.add(holoGroup)

    const holoScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.55, 0.34),
      new THREE.MeshBasicMaterial({
        map: screenTexture,
      })
    )
    holoScreen.position.z = 0.011
    holoGroup.add(holoScreen)

    const holoChassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.37, 0.016),
      laptopMetalMat
    )
    holoChassis.castShadow = true
    holoGroup.add(holoChassis)

    const holoBackAccent = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.018, 0.006),
      creamGlowMat
    )
    holoBackAccent.position.set(0, 0, -0.01)
    holoGroup.add(holoBackAccent)

    // Subtle floating data particles around workstation
    const particleGeo = new THREE.BufferGeometry()
    const pCount = 28
    const pPositions = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      const ang = (i / pCount) * Math.PI * 2
      const rad = 0.85 + (i % 4) * 0.22
      pPositions[i * 3] = Math.cos(ang) * rad
      pPositions[i * 3 + 1] = 0.08 + ((i * 37) % 100) * 0.0085
      pPositions[i * 3 + 2] = Math.sin(ang) * rad - 0.1
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
    const particleSystem = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        color: 0xf0e4c9,
        size: 0.028,
        transparent: true,
        opacity: 0.55,
      })
    )
    world.add(particleSystem)

    // Coffee Mug + Animated Rising Steam Puffs on right side of desk
    const mugGroup = new THREE.Group()
    mugGroup.position.set(0.68, 0, 0.18)
    world.add(mugGroup)

    const mugBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.06, 0.145, 20),
      new THREE.MeshStandardMaterial({ color: 0x23232c, roughness: 0.35 })
    )
    mugBody.position.y = 0.073
    mugBody.castShadow = true
    mugGroup.add(mugBody)

    const mugBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.069, 0.068, 0.022, 20),
      creamGlowMat
    )
    mugBand.position.y = 0.105
    mugGroup.add(mugBand)

    const coffeeSurface = new THREE.Mesh(
      new THREE.CircleGeometry(0.06, 18),
      new THREE.MeshStandardMaterial({ color: 0x2a1d12, roughness: 0.3 })
    )
    coffeeSurface.rotation.x = -Math.PI / 2
    coffeeSurface.position.y = 0.142
    mugGroup.add(coffeeSurface)

    const mugHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.04, 0.011, 10, 18, Math.PI),
      darkMetalMat
    )
    mugHandle.position.set(0.068, 0.075, 0)
    mugHandle.rotation.z = -Math.PI / 2
    mugGroup.add(mugHandle)

    const steamPuffs: THREE.Mesh[] = []
    for (let s = 0; s < 4; s++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.022 + s * 0.004, 12, 12),
        new THREE.MeshBasicMaterial({
          color: 0xf0e4c9,
          transparent: true,
          opacity: 0.3,
        })
      )
      mugGroup.add(puff)
      steamPuffs.push(puff)
    }

    // Mini GIS Telemetry Dock on right-back corner
    const telemetryDock = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.055, 0.14),
      darkMetalMat
    )
    telemetryDock.position.set(0.68, 0.028, -0.14)
    world.add(telemetryDock)

    const ledA = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), softCreamGlowMat)
    ledA.position.set(0.63, 0.06, -0.09)
    world.add(ledA)

    const ledB = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), creamGlowMat)
    ledB.position.set(0.68, 0.06, -0.09)
    world.add(ledB)

    // 3D Developer Character seated at (0, -0.18, -0.55) facing +z
    const charGroup = new THREE.Group()
    world.add(charGroup)

    // Lower body (legs & sneakers seated cleanly under desk)
    ;[-0.135, 0.135].forEach((lx) => {
      const thigh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.088, 0.34, 8, 14),
        pantsMat
      )
      thigh.rotation.x = Math.PI / 2
      thigh.position.set(lx, -0.17, -0.37)
      charGroup.add(thigh)

      const shin = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.075, 0.44, 8, 14),
        pantsMat
      )
      shin.position.set(lx, -0.47, -0.19)
      charGroup.add(shin)

      const shoe = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.085, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x1d1d25, roughness: 0.55 })
      )
      shoe.position.set(lx, -0.76, -0.14)
      charGroup.add(shoe)

      const sole = new THREE.Mesh(
        new THREE.BoxGeometry(0.136, 0.024, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x3a3a45, roughness: 0.45 })
      )
      sole.position.set(lx, -0.8, -0.14)
      charGroup.add(sole)
    })

    // Upper body torso group (subtle breathing + forward coding lean)
    const torsoGroup = new THREE.Group()
    torsoGroup.position.set(0, -0.14, -0.55)
    torsoGroup.rotation.x = 0.11
    charGroup.add(torsoGroup)

    const hoodieTorso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.205, 0.34, 12, 20),
      hoodieMat
    )
    hoodieTorso.position.set(0, 0.29, 0)
    hoodieTorso.scale.set(1.12, 1, 0.84)
    hoodieTorso.castShadow = true
    torsoGroup.add(hoodieTorso)

    // Hoodie collar & drawstrings
    const hoodCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.125, 0.042, 10, 22),
      hoodieMat
    )
    hoodCollar.rotation.x = Math.PI / 2 + 0.15
    hoodCollar.position.set(0, 0.52, -0.02)
    torsoGroup.add(hoodCollar)

    ;[-0.045, 0.045].forEach((sx) => {
      const cord = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.15, 8),
        creamGlowMat
      )
      cord.position.set(sx, 0.42, 0.168)
      torsoGroup.add(cord)
    })

    // Neck + Expressive Character Head
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.076, 0.12, 14),
      skinMat
    )
    neck.position.set(0, 0.58, 0.01)
    torsoGroup.add(neck)

    const headGroup = new THREE.Group()
    headGroup.position.set(0, 0.74, 0.03)
    torsoGroup.add(headGroup)

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.168, 28, 24), skinMat)
    skull.scale.set(0.95, 1.04, 0.96)
    skull.castShadow = true
    headGroup.add(skull)

    // Ears
    ;[-0.16, 0.16].forEach((ex) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), skinMat)
      ear.scale.set(0.55, 1, 0.75)
      ear.position.set(ex, 0.0, -0.01)
      headGroup.add(ear)
    })

    // Stylized Layered Hair
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.176, 26, 22, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    )
    hairCap.position.set(0, 0.018, -0.012)
    hairCap.rotation.x = -0.16
    headGroup.add(hairCap)

    const hairFringe = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.048, 0.19, 8, 14),
      hairMat
    )
    hairFringe.rotation.z = Math.PI / 2 - 0.12
    hairFringe.position.set(0.01, 0.125, 0.125)
    headGroup.add(hairFringe)

    // Eyebrows & Blinking Eyes
    const eyeGroups: THREE.Group[] = []
    ;[-0.062, 0.062].forEach((ex) => {
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.013, 0.016), hairMat)
      brow.position.set(ex, 0.052, 0.155)
      brow.rotation.z = ex < 0 ? 0.06 : -0.06
      headGroup.add(brow)

      const eyeHolder = new THREE.Group()
      eyeHolder.position.set(ex, 0.016, 0.153)
      headGroup.add(eyeHolder)

      const pupil = new THREE.Mesh(
        new THREE.SphereGeometry(0.021, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0x0b0b10, roughness: 0.18 })
      )
      pupil.scale.set(1, 1.15, 0.6)
      eyeHolder.add(pupil)

      const catchlight = new THREE.Mesh(
        new THREE.SphereGeometry(0.006, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xf0e4c9 })
      )
      catchlight.position.set(0.007, 0.007, 0.012)
      eyeHolder.add(catchlight)

      eyeGroups.push(eyeHolder)
    })

    // Subtle nose & confident smile arc
    const nose = new THREE.Mesh(
      new THREE.ConeGeometry(0.022, 0.055, 12),
      skinMat
    )
    nose.position.set(0, -0.015, 0.172)
    nose.rotation.x = Math.PI / 2 - 0.25
    headGroup.add(nose)

    const smile = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.0055, 8, 16, Math.PI * 0.8),
      new THREE.MeshStandardMaterial({ color: 0x7a4a3c, roughness: 0.6 })
    )
    smile.position.set(0, -0.052, 0.154)
    smile.rotation.z = Math.PI + 0.31
    headGroup.add(smile)

    // Developer Glasses catching laptop glow
    const glassLensMat = new THREE.MeshPhysicalMaterial({
      color: 0xf0e4c9,
      transparent: true,
      opacity: 0.28,
      roughness: 0.08,
      metalness: 0.1,
    })
    ;[-0.064, 0.064].forEach((gx) => {
      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(0.082, 0.056, 0.012),
        new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.32, metalness: 0.6 })
      )
      rim.position.set(gx, 0.016, 0.168)

      const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.042), glassLensMat)
      lens.position.set(gx, 0.016, 0.175)
      headGroup.add(lens)

      // Frame borders + side temple arm to ear
      const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.008, 0.012), darkMetalMat)
      topBar.position.set(gx, 0.042, 0.172)
      const botBar = topBar.clone()
      botBar.position.set(gx, -0.01, 0.172)
      const temple = new THREE.Mesh(new THREE.BoxGeometry(0.007, 0.007, 0.165), darkMetalMat)
      temple.position.set(gx > 0 ? 0.128 : -0.128, 0.03, 0.09)
      temple.rotation.y = gx > 0 ? -0.14 : 0.14
      headGroup.add(topBar, botBar, temple)
      void rim
    })
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.008, 0.012), darkMetalMat)
    bridge.position.set(0, 0.024, 0.173)
    headGroup.add(bridge)

    // Studio Over-Ear Headphones with glowing cream ring
    const headband = new THREE.Mesh(
      new THREE.TorusGeometry(0.184, 0.016, 10, 28, Math.PI * 1.05),
      darkMetalMat
    )
    headband.position.set(0, 0.01, -0.01)
    headband.rotation.z = -0.025
    headGroup.add(headband)

    ;[-0.178, 0.178].forEach((hx) => {
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.056, 0.056, 0.038, 20),
        darkMetalMat
      )
      cup.rotation.z = Math.PI / 2
      cup.position.set(hx, 0.005, -0.008)
      headGroup.add(cup)

      const cupRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.046, 0.005, 8, 20),
        creamGlowMat
      )
      cupRing.rotation.y = Math.PI / 2
      cupRing.position.set(hx + (hx > 0 ? 0.02 : -0.02), 0.005, -0.008)
      headGroup.add(cupRing)
    })

    // Two-Bone IK Arms + Hands (unit-height cylinders scaled clean each frame + joint spheres)
    const armLimbGeo = new THREE.CylinderGeometry(0.052, 0.044, 1, 14)
    const foreLimbGeo = new THREE.CylinderGeometry(0.043, 0.036, 1, 14)

    const createArmRig = () => {
      const upper = new THREE.Mesh(armLimbGeo, hoodieMat)
      const fore = new THREE.Mesh(foreLimbGeo, hoodieMat)
      const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 12), hoodieMat)
      const elbowCap = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), hoodieMat)
      const hand = new THREE.Group()
      const palm = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 14), skinMat)
      palm.scale.set(1.05, 0.62, 1.25)
      hand.add(palm)

      for (let f = -1.5; f <= 1.5; f += 1) {
        const finger = new THREE.Mesh(
          new THREE.CapsuleGeometry(0.0085, 0.026, 6, 8),
          skinMat
        )
        finger.rotation.x = Math.PI / 2 + 0.35
        finger.position.set(f * 0.015, -0.006, 0.038)
        hand.add(finger)
      }

      upper.castShadow = true
      fore.castShadow = true
      world.add(upper, fore, shoulderCap, elbowCap, hand)
      return { upper, fore, shoulderCap, elbowCap, hand }
    }

    const leftArm = createArmRig()
    const rightArm = createArmRig()

    // Pointer drag orbit + hover parallax
    let isDragging = false
    let prevX = 0
    let prevY = 0
    const currentOrbit = { ...PRESETS.studio }

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      prevX = e.clientX
      prevY = e.clientY
      container.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - prevX
      const dy = e.clientY - prevY
      prevX = e.clientX
      prevY = e.clientY
      targetOrbitRef.current.theta -= dx * 0.0075
      targetOrbitRef.current.phi = THREE.MathUtils.clamp(
        targetOrbitRef.current.phi + dy * 0.0055,
        0.16,
        0.95
      )
    }

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false
        try {
          container.releasePointerCapture(e.pointerId)
        } catch {
          // Safe fallback if already released
        }
      }
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)
    container.addEventListener('pointercancel', onPointerUp)

    const shoulderL = new THREE.Vector3()
    const shoulderR = new THREE.Vector3()
    const handTargetL = new THREE.Vector3()
    const handTargetR = new THREE.Vector3()
    const elbowL = new THREE.Vector3()
    const elbowR = new THREE.Vector3()
    const poleL = new THREE.Vector3(-0.46, -0.82, -0.26).normalize()
    const poleR = new THREE.Vector3(0.46, -0.82, -0.26).normalize()

    const clock = new THREE.Clock()
    let rafId = 0

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const fast = turboRef.current
      const rate = fast ? 2.25 : 1.0

      // Update live IDE code canvas texture
      drawCodeScreen(t, fast)

      // Smoothly interpolate camera orbit
      const tgt = targetOrbitRef.current
      currentOrbit.theta += (tgt.theta - currentOrbit.theta) * 0.075
      currentOrbit.phi += (tgt.phi - currentOrbit.phi) * 0.075
      currentOrbit.radius += (tgt.radius - currentOrbit.radius) * 0.075

      const idleSway = isDragging ? 0 : Math.sin(t * 0.55) * 0.035
      const theta = currentOrbit.theta + idleSway
      const phi = currentOrbit.phi
      const r = currentOrbit.radius

      camera.position.set(
        lookTarget.x + r * Math.cos(phi) * Math.sin(theta),
        lookTarget.y + r * Math.sin(phi),
        lookTarget.z + r * Math.cos(phi) * Math.cos(theta)
      )
      camera.lookAt(lookTarget)

      // Torso subtle breathing & focused head movement
      torsoGroup.position.y = -0.14 + Math.sin(t * 1.9) * 0.006
      torsoGroup.rotation.x = 0.11 + Math.sin(t * 1.4) * 0.012

      // Head scans smoothly between main laptop screen & left holographic monitor
      const lookCycle = Math.sin(t * 0.85)
      headGroup.rotation.y = (lookCycle > 0.55 ? 0.24 : 0) + Math.sin(t * 2.4 * rate) * 0.035
      headGroup.rotation.x = 0.14 + Math.sin(t * 3.1 * rate) * 0.025
      headGroup.rotation.z = Math.sin(t * 1.7) * 0.02

      // Natural blinking every ~3.6s
      const blinkPhase = (t * 0.9) % 3.4
      const blinkScale = blinkPhase > 3.26 ? 0.08 : 1.0
      eyeGroups.forEach((eg) => {
        eg.scale.y = blinkScale
      })

      // Compute exact world shoulder anchors cleanly on frame 0+
      torsoGroup.updateWorldMatrix(true, false)
      shoulderL.set(-0.225, 0.48, 0.0).applyMatrix4(torsoGroup.matrixWorld)
      shoulderR.set(0.225, 0.48, 0.0).applyMatrix4(torsoGroup.matrixWorld)
      particleSystem.rotation.y = t * 0.12

      // Realistic alternating left & right typing keystrokes over keyboard
      const typeSpeed = 11.5 * rate
      const lWave = Math.sin(t * typeSpeed)
      const rWave = Math.sin(t * typeSpeed + Math.PI * 0.88)

      const lKeyX = -0.115 + Math.sin(t * 3.1 * rate) * 0.065
      const lKeyZ = 0.045 + Math.cos(t * 2.3 * rate) * 0.045
      const lLift = Math.max(0, lWave) * 0.026

      const rKeyX = 0.115 + Math.cos(t * 2.9 * rate) * 0.065
      const rKeyZ = 0.045 + Math.sin(t * 2.6 * rate) * 0.045
      const rLift = Math.max(0, rWave) * 0.026

      handTargetL.set(lKeyX, 0.048 + lLift, lKeyZ)
      handTargetR.set(rKeyX, 0.048 + rLift, rKeyZ)

      solveTwoBoneIK(shoulderL, handTargetL, poleL, 0.31, 0.31, elbowL)
      solveTwoBoneIK(shoulderR, handTargetR, poleR, 0.31, 0.31, elbowR)

      leftArm.shoulderCap.position.copy(shoulderL)
      leftArm.elbowCap.position.copy(elbowL)
      alignLimb(leftArm.upper, shoulderL, elbowL)
      alignLimb(leftArm.fore, elbowL, handTargetL)
      leftArm.hand.position.copy(handTargetL)
      leftArm.hand.rotation.set(0.18 - lLift * 3.2, -0.1, 0)

      rightArm.shoulderCap.position.copy(shoulderR)
      rightArm.elbowCap.position.copy(elbowR)
      alignLimb(rightArm.upper, shoulderR, elbowR)
      alignLimb(rightArm.fore, elbowR, handTargetR)
      rightArm.hand.position.copy(handTargetR)
      rightArm.hand.rotation.set(0.18 - rLift * 3.2, 0.1, 0)

      // Depress & illuminate active laptop keycaps under typing fingers
      const activeIdxL =
        Math.abs(Math.floor(t * 6.5 * rate)) % Math.floor(keyMeshes.length / 2)
      const activeIdxR =
        Math.floor(keyMeshes.length / 2) +
        (Math.abs(Math.floor(t * 6.5 * rate + 3)) % Math.floor(keyMeshes.length / 2))

      keyMeshes.forEach((km, idx) => {
        const isHit = idx === activeIdxL || idx === activeIdxR
        const mat = km.material as THREE.MeshStandardMaterial
        km.position.y = isHit ? 0.0245 : 0.029
        mat.emissiveIntensity = isHit ? 2.2 : 0.22
      })

      // Dynamic screen light subtle pulse
      screenGlow.intensity = (fast ? 2.2 : 1.6) + Math.sin(t * 7.5) * 0.12

      // Rising coffee steam puffs
      steamPuffs.forEach((puff, idx) => {
        const progress = ((t * 0.38 + idx * 0.25) % 1)
        puff.position.set(
          Math.sin(t * 2 + idx) * 0.018,
          0.16 + progress * 0.24,
          Math.cos(t * 1.7 + idx) * 0.015
        )
        const sc = 0.65 + progress * 0.85
        puff.scale.setScalar(sc)
        ;(puff.material as THREE.MeshBasicMaterial).opacity =
          Math.sin(progress * Math.PI) * 0.28
      })

      // Telemetry LED blink
      ;(ledA.material as THREE.MeshStandardMaterial).emissiveIntensity =
        Math.sin(t * 5) > 0 ? 2.0 : 0.4

      renderer.render(scene, camera)
    }

    animate()

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const w = Math.max(entry.contentRect.width, 240)
      const h = Math.max(entry.contentRect.height, 260)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(container)

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('pointercancel', onPointerUp)
      screenTexture.dispose()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <figure className={`photo-slot dev-3d-slot ${className} w-full m-0`}>
      <div className="photo-frame dev-3d-frame relative w-full h-[clamp(360px,_46vw,_470px)] overflow-hidden border border-line-2 rounded-xl bg-[radial-gradient(circle_at_50%_36%,#1b1b23,#0b0b0f_74%)] shadow-[0_30px_70px_-34px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div className="dev-3d-topbar absolute z-4 top-[13px] right-[13px] left-[13px] flex items-center justify-between gap-[0.5rem] pointer-events-none">
          <span className="dev-live-pill inline-flex items-center gap-[7px] px-[0.8rem] py-[0.4rem] rounded-full border border-line-2 bg-[rgba(11,11,15,0.76)] backdrop-blur-[10px] font-mono text-[0.7rem] text-[#e8e6e0]">
            <span className="pulseDot" /> 3D DEV · LIVE CODING
          </span>
          <button
            type="button"
            className={`dev-chip-btn ${turbo ? 'is-active' : ''} inline-flex items-center gap-[6px] px-[0.8rem] py-[0.4rem] rounded-full border border-line-2 bg-[rgba(11,11,15,0.76)] backdrop-blur-[10px] text-text font-semibold text-[0.8rem] pointer-events-auto cursor-pointer hover:bg-[rgba(255,255,255,0.14)] hover:border-line-3 transition-all duration-200`}
            onClick={() => setTurbo((v) => !v)}
          >
            <Sparkles size={12} />
            <span>{turbo ? 'Turbo ON' : 'Turbo Ship'}</span>
          </button>
        </div>

        <div
          ref={mountRef}
          className="dev-3d-canvas w-full h-full cursor-grab touch-none"
          role="img"
          aria-label="Interactive 3D developer character coding on a laptop"
        />

        <div className="dev-3d-controls absolute z-4 bottom-[13px] left-1/2 flex items-center gap-[0.2rem] px-[0.3rem] rounded-full border border-line bg-[rgba(11,11,15,0.8)] backdrop-blur-[12px] translate-x-[-50%]">
          <button
            type="button"
            className={`dev-cam-btn ${preset === 'studio' ? 'is-active' : ''} inline-flex items-center gap-[5px] px-[0.78rem] py-[0.42rem] rounded-full border-0 bg-transparent text-muted font-mono text-[0.82rem] font-medium whitespace-nowrap cursor-pointer hover:text-text hover:bg-[rgba(255,255,255,0.14)] transition-all duration-200`}
            onClick={() => setPreset('studio')}
          >
            <Cpu size={12} />
            <span>Studio 3/4</span>
          </button>
          <button
            type="button"
            className={`dev-cam-btn ${preset === 'screen' ? 'is-active' : ''} inline-flex items-center gap-[5px] px-[0.78rem] py-[0.42rem] rounded-full border-0 bg-transparent text-muted font-mono text-[0.82rem] font-medium whitespace-nowrap cursor-pointer hover:text-text hover:bg-[rgba(255,255,255,0.14)] transition-all duration-200`}
            onClick={() => setPreset('screen')}
          >
            <Code2 size={12} />
            <span>IDE Screen</span>
          </button>
          <button
            type="button"
            className={`dev-cam-btn ${preset === 'front' ? 'is-active' : ''} inline-flex items-center gap-[5px] px-[0.78rem] py-[0.42rem] rounded-full border-0 bg-transparent text-muted font-mono text-[0.82rem] font-medium whitespace-nowrap cursor-pointer hover:text-text hover:bg-[rgba(255,255,255,0.14)] transition-all duration-200`}
            onClick={() => setPreset('front')}
          >
            <Eye size={12} />
            <span>Front Desk</span>
          </button>
        </div>
      </div>
      <figcaption className="stage-caption mt-[0.75rem] font-mono text-[0.7rem] tracking-[0.02em] leading-[1.55] text-muted text-center">
        3D Developer Workstation · Drag anywhere to orbit · Three.js real-time IK
      </figcaption>
    </figure>
  )
}
