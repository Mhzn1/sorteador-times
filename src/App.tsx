import { useState, useEffect, useRef } from 'react'
import './App.css'

type GameFormat = 'futsal' | 'society' | null
type FutsalFormation = 'formacao1' | 'formacao2' | null

interface Position {
  name: string
  quantity: number
}

interface PlayerSlot {
  position: string
  name: string
}

interface Team {
  name: string
  players: { name: string; position: string }[]
}

function App() {
  const [gameFormat, setGameFormat] = useState<GameFormat>(null)
  const [futsalFormation, setFutsalFormation] = useState<FutsalFormation>(null)
  const [playerSlots, setPlayerSlots] = useState<PlayerSlot[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [showResults, setShowResults] = useState(false)
  const [copied, setCopied] = useState(false)
  const slotsInitialized = useRef(false)

  const getPositions = (): Position[] => {
    if (gameFormat === 'futsal') {
      if (futsalFormation === 'formacao1') {
        return [
          { name: 'Goleiro', quantity: 1 },
          { name: 'Ala', quantity: 2 },
          { name: 'Fixo', quantity: 1 },
          { name: 'Pivô', quantity: 1 }
        ]
      } else if (futsalFormation === 'formacao2') {
        return [
          { name: 'Goleiro', quantity: 1 },
          { name: 'Defensor', quantity: 2 },
          { name: 'Atacante', quantity: 2 }
        ]
      }
    } else if (gameFormat === 'society') {
      return [
        { name: 'Goleiro', quantity: 1 },
        { name: 'Zagueiro', quantity: 1 },
        { name: 'Lateral', quantity: 2 },
        { name: 'Meio-campista', quantity: 2 },
        { name: 'Atacante', quantity: 1 }
      ]
    }
    return []
  }


  const updatePlayerSlot = (index: number, name: string) => {
    const newSlots = [...playerSlots]
    newSlots[index].name = name
    setPlayerSlots(newSlots)
  }

  const getTotalPlayersNeeded = (): number => {
    return playerSlots.length
  }

  const getFilledSlots = (): number => {
    return playerSlots.filter(slot => slot.name.trim() !== '').length
  }

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const sortTeams = () => {
    const filledSlots = playerSlots.filter(slot => slot.name.trim() !== '')
    
    if (filledSlots.length < getTotalPlayersNeeded()) {
      alert(`Você precisa preencher todas as ${getTotalPlayersNeeded()} posições!`)
      return
    }

    const positions = getPositions()
    const team1: Team = { name: 'Time 1', players: [] }
    const team2: Team = { name: 'Time 2', players: [] }

    const team1Positions: { [key: string]: number } = {}
    const team2Positions: { [key: string]: number } = {}
    
    positions.forEach(pos => {
      team1Positions[pos.name] = 0
      team2Positions[pos.name] = 0
    })

    const shuffledPlayers = shuffleArray([...filledSlots])

    shuffledPlayers.forEach(slot => {
      const position = slot.position
      const playerName = slot.name.trim()
      
      const team1Needs = team1Positions[position] < positions.find(p => p.name === position)!.quantity
      const team2Needs = team2Positions[position] < positions.find(p => p.name === position)!.quantity
      
      if (team1Needs && team2Needs) {
        const randomTeam = Math.random() < 0.5 ? team1 : team2
        const teamPositions = randomTeam === team1 ? team1Positions : team2Positions
        randomTeam.players.push({
          name: playerName,
          position: position
        })
        teamPositions[position]++
      } else if (team1Needs) {
        team1.players.push({
          name: playerName,
          position: position
        })
        team1Positions[position]++
      } else if (team2Needs) {
        team2.players.push({
          name: playerName,
          position: position
        })
        team2Positions[position]++
      }
    })

    const positionOrder = positions.map(p => p.name)
    const sortByPosition = (a: { name: string; position: string }, b: { name: string; position: string }) => {
      const indexA = positionOrder.indexOf(a.position)
      const indexB = positionOrder.indexOf(b.position)
      if (indexA !== indexB) {
        return indexA - indexB
      }
      return a.name.localeCompare(b.name)
    }

    team1.players.sort(sortByPosition)
    team2.players.sort(sortByPosition)

    setTeams([team1, team2])
    setShowResults(true)
  }

  const copyTeams = async () => {
    if (teams.length !== 2) return

    const team1 = teams[0]
    const team2 = teams[1]

    let text = `Time Azul x Time Vermelho\n\n`
    
    text += `Time Azul\n`
    team1.players.forEach(player => {
      text += `${player.name} - ${player.position}\n`
    })
    
    text += `\nTime Vermelho\n`
    team2.players.forEach(player => {
      text += `${player.name} - ${player.position}\n`
    })

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const reset = () => {
    setGameFormat(null)
    setFutsalFormation(null)
    setPlayerSlots([])
    setTeams([])
    setShowResults(false)
    setCopied(false)
  }

  useEffect(() => {
    const shouldInit = gameFormat && (gameFormat !== 'futsal' || futsalFormation) && playerSlots.length === 0 && !slotsInitialized.current
    
    if (shouldInit) {
      const positions = getPositions()
      const slots: PlayerSlot[] = []
      
      positions.forEach(position => {
        const totalNeeded = position.quantity * 2
        for (let i = 0; i < totalNeeded; i++) {
          slots.push({
            position: position.name,
            name: ''
          })
        }
      })
      
      slotsInitialized.current = true
      setTimeout(() => {
        setPlayerSlots(slots)
      }, 0)
    }
    
    if (!gameFormat) {
      slotsInitialized.current = false
    }
  }, [gameFormat, futsalFormation, playerSlots.length])

  return (
    <div className={`app ${!gameFormat ? 'initial-page' : ''}`}>
      <div className="container">
        <h1 className="title">⚽ Sorteador de Times</h1>

        {!showResults ? (
          <>
            {!gameFormat ? (
              <div className="format-selection">
                <h2>Escolha o formato do jogo:</h2>
                <div className="format-buttons">
                  <button
                    className="format-btn futsal"
                    onClick={() => setGameFormat('futsal')}
                  >
                    <span className="icon">🏃</span>
                    <span className="label">Futsal</span>
                    <span className="subtitle">4 jogadores + goleiro</span>
                  </button>
                  <button
                    className="format-btn society"
                    onClick={() => setGameFormat('society')}
                  >
                    <span className="icon">⚽</span>
                    <span className="label">Society</span>
                    <span className="subtitle">6 jogadores + goleiro</span>
                  </button>
                </div>
              </div>
            ) : gameFormat === 'futsal' && !futsalFormation ? (
              <div className="formation-selection">
                <h2>Escolha a formação do Futsal:</h2>
                <div className="formation-buttons">
                  <button
                    className="formation-btn"
                    onClick={() => setFutsalFormation('formacao1')}
                  >
                    <div className="formation-title">Formação 1</div>
                    <div className="formation-details">
                      <div>1 Goleiro</div>
                      <div>2 Alas</div>
                      <div>1 Fixo</div>
                      <div>1 Pivô</div>
                    </div>
                  </button>
                  <button
                    className="formation-btn"
                    onClick={() => setFutsalFormation('formacao2')}
                  >
                    <div className="formation-title">Formação 2</div>
                    <div className="formation-details">
                      <div>1 Goleiro</div>
                      <div>2 Defensores</div>
                      <div>2 Atacantes</div>
                    </div>
                  </button>
                </div>
                <button className="back-btn" onClick={() => setGameFormat(null)}>
                  ← Voltar
                </button>
              </div>
            ) : (
              <div className="players-section">
                <div className="section-header">
                  <h2>
                    {gameFormat === 'futsal' ? 'Futsal' : 'Society'} - Preencha os jogadores
                  </h2>
                  <button className="back-btn" onClick={reset}>
                    ← Voltar ao início
                  </button>
                </div>

                <div className="positions-info">
                  <p className="total-needed">
                    Preencha {getTotalPlayersNeeded()} posições ({getFilledSlots()} preenchidas)
                  </p>
                </div>

                <div className="slots-container">
                  {getPositions().map((position, posIdx) => {
                    const positionSlots = playerSlots
                      .map((slot, idx) => ({ slot, idx }))
                      .filter(({ slot }) => slot.position === position.name)
                    
                    return (
                      <div key={posIdx} className="position-group">
                        <h3 className="position-group-title">
                          {position.name} ({position.quantity * 2} jogadores - {position.quantity} por time)
                        </h3>
                        <div className="slots-grid">
                          {positionSlots.map(({ slot, idx }, slotIdx) => (
                            <div key={idx} className="slot-item">
                              <input
                                type="text"
                                value={slot.name}
                                onChange={(e) => updatePlayerSlot(idx, e.target.value)}
                                placeholder={`${position.name} ${slotIdx + 1}`}
                                className="slot-input"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {getFilledSlots() >= getTotalPlayersNeeded() && (
                  <button onClick={sortTeams} className="sort-btn">
                    🎲 Sortear Times
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="results-section">
            <h2>Times Sorteados!</h2>
            <div className="teams-container">
              {teams.map((team, teamIndex) => (
                <div key={teamIndex} className="team-card">
                  <h3 className="team-name">{team.name}</h3>
                  <div className="team-players">
                    {team.players.map((player, playerIndex) => (
                      <div key={playerIndex} className="player-position-card">
                        <div className="player-name">{player.name}</div>
                        <div className="player-position">{player.position}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="results-actions">
              <button onClick={copyTeams} className="copy-btn">
                {copied ? '✓ Copiado!' : '📋 Copiar Times'}
              </button>
              <button onClick={reset} className="new-sort-btn">
                🔄 Novo Sorteio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
