# Endless Mountain Ball

## Kurzbeschreibung

**Endless Mountain Ball** ist ein schnelles Arcade-Downhill-Game in Three.js.  
Du bist kein Charakter, kein Fahrer und kein Fahrzeug — du bist einfach ein Ball.

Der Ball rollt einen endlosen, prozedural generierten Berg hinunter. Je länger du überlebst, desto schneller wird alles. Ziel ist es, möglichst weit zu kommen, Combos zu sammeln, Hindernissen auszuweichen und den eigenen Highscore zu schlagen.

> **Elevator Pitch:**  
> Ein endloses Three.js-Arcade-Spiel, in dem du als Ball einen immer schnelleren prozeduralen Berg hinunterrollst, Kristalle sammelst, Hindernissen ausweichst und im Flow bleibst.

---

## Genre

- Endless Runner
- Arcade Downhill Racing
- Physics-lite Skill Game
- Score-Chaser

---

## Plattform

Primär:

- Browser
- Desktop
- Mobile Web später möglich

Technologie:

- Three.js
- JavaScript oder TypeScript
- Optional: Rapier.js für Physik
- Optional: Zustand, Vite, ECS oder eigenes kleines Game-State-System

---

## Core Fantasy

Der Spieler soll sich fühlen, als würde er mit einem Ball in hoher Geschwindigkeit einen riesigen Berg hinunterrasen.

Das Spielgefühl soll sein:

- schnell
- glatt
- gefährlich
- leicht zu lernen
- schwer zu meistern
- sofort wiederholbar

Der wichtigste Satz:

> **Noch eine Runde, diesmal komme ich weiter.**

---

## Core Loop

1. Run starten
2. Ball rollt bergab
3. Spieler lenkt links/rechts
4. Hindernissen ausweichen
5. Collectibles sammeln
6. Geschwindigkeit steigt kontinuierlich
7. Fehler machen oder abstürzen
8. Score anzeigen
9. Upgrade, Skin oder neue Bestmarke sehen
10. Sofort neu starten

---

## Hauptmechanik

Der Spieler kontrolliert einen Ball auf einem endlosen Berg.

Der Ball bewegt sich automatisch nach vorne beziehungsweise bergab. Der Spieler steuert nur seitlich und kann optional springen oder boosten.

### Minimalsteuerung

Desktop:

| Aktion | Taste |
|---|---|
| Links lenken | A / Pfeil links |
| Rechts lenken | D / Pfeil rechts |
| Springen | Leertaste |
| Schneller rollen / Duck-Modus | W / Pfeil hoch |
| Bremsen / Stabilisieren | S / Pfeil runter |

Mobile:

| Aktion | Eingabe |
|---|---|
| Links/rechts lenken | Swipe oder virtueller Joystick |
| Springen | Tap |
| Boost | Halten |

---

## Ball-Gefühl

Der Ball ist die Hauptfigur. Er soll Charakter haben, obwohl er nur eine Kugel ist.

Wichtig:

- Der Ball rotiert sichtbar passend zur Geschwindigkeit.
- Bei hoher Geschwindigkeit bekommt er einen Trail.
- Beim Landen gibt es Squash/Stretch oder Partikel.
- Bei Kollisionen gibt es Screenshake und Sound.
- Bei perfektem Flow glüht der Ball leicht.

### Ball-Varianten als Skins

- Schneeball
- Glasball
- Lava-Ball
- Neon-Ball
- Discokugel
- Gummiball
- Auge-Ball
- Planet-Ball
- Pixel-Ball
- Goldener Ball

Alle Skins sind kosmetisch und verändern die Spielbalance nicht.

---

## Spielziel

Das Ziel ist nicht, ein Ende zu erreichen.  
Das Ziel ist, möglichst lange zu überleben und den besten Score zu schaffen.

Der Score basiert auf:

- Distanz
- Geschwindigkeit
- gesammelten Kristallen
- Combo-Multiplikator
- Near Misses
- Airtime
- perfekte Landungen
- Checkpoint-Streaks

---

## Suchtfaktor

Das Spiel soll über kurze, intensive Runs funktionieren.

### Warum man immer wieder spielt

- Runs dauern am Anfang nur 30 bis 90 Sekunden.
- Jeder Fehler ist verständlich.
- Der Restart ist sofort.
- Der Highscore ist immer sichtbar.
- Es gibt Ghost-Runs gegen die eigene Bestleistung.
- Kleine Belohnungen kommen nach fast jedem Run.

### Wichtigste Designregel

> Der Spieler darf nie denken: „Das Spiel war unfair.“  
> Er soll denken: „Das war mein Fehler. Nochmal.“

---

## Schwierigkeit

Die Schwierigkeit steigt dynamisch mit der Überlebenszeit.

### Difficulty Ramp

| Zeit | Intensität | Beschreibung |
|---:|---|---|
| 0–30 Sekunden | Easy | Breite Strecke, wenige Hindernisse |
| 30–60 Sekunden | Medium | Mehr Hindernisse, erste Lücken |
| 60–120 Sekunden | Hard | Enge Passagen, höhere Geschwindigkeit |
| 120–180 Sekunden | Extreme | Sprünge, bewegliche Hindernisse, weniger Reaktionszeit |
| 180+ Sekunden | Chaos | Fast alles ist gefährlich, Spieler muss im Flow bleiben |

### Schwierigkeit wird erhöht durch

- höhere Geschwindigkeit
- engere Streckensegmente
- mehr Hindernisse
- kleinere sichere Pfade
- weniger Checkpoint-Tore
- gefährlichere Biome
- mehr Kurven
- mehr Sprungpassagen

---

## Prozedurale Strecke

Die Strecke besteht aus aneinandergereihten Segmenten. Jedes Segment ist ein Stück Berg.

### Segment-Typen

1. **Straight**  
   Ein gerades Stück zum Beschleunigen.

2. **Soft Curve**  
   Eine leichte Kurve nach links oder rechts.

3. **Hard Curve**  
   Eine starke Kurve mit Risiko.

4. **Narrow Path**  
   Eine enge Passage mit Abgrund links und rechts.

5. **Jump Ramp**  
   Eine Rampe mit Airtime.

6. **Crystal Line**  
   Eine Linie aus Collectibles, die eine ideale Fahrspur zeigt.

7. **Obstacle Field**  
   Viele Felsen, Bäume oder Eisblöcke.

8. **Split Path**  
   Zwei Wege: sicherer Weg und riskanter Bonus-Weg.

9. **Tunnel**  
   Kurze Höhle mit eingeschränkter Sicht.

10. **Avalanche Zone**  
   Gefahr von hinten, Spieler muss schnell bleiben.

---

## World Generation

Die Welt wird nicht komplett auf einmal erzeugt. Stattdessen werden immer nur Segmente um den Spieler herum geladen.

### Chunk-System

- Strecke besteht aus Chunks.
- Jeder Chunk hat eine Länge, Breite und Schwierigkeit.
- Neue Chunks werden vor dem Spieler erzeugt.
- Alte Chunks hinter dem Spieler werden entfernt.
- Dadurch bleibt die Performance stabil.

### Beispielwerte

```js
const CHUNK_LENGTH = 80;
const CHUNK_WIDTH = 30;
const ACTIVE_CHUNKS_AHEAD = 8;
const ACTIVE_CHUNKS_BEHIND = 3;
```

---

## Seed-System

Jeder Run kann einen Seed haben.

Vorteile:

- Daily Challenge möglich
- gleiche Strecke für alle Spieler
- Ghost Runs sind vergleichbar
- Debugging ist einfacher

Beispiel:

```js
const seed = "2026-06-11-daily-mountain";
```

---

## Pseudocode: Chunk Generation

```js
function generateChunk(index, difficulty, rng) {
  const type = pickChunkType(difficulty, rng);
  const curve = rng.range(-1, 1) * difficulty.curveIntensity;
  const width = lerp(32, 14, difficulty.value);
  const obstacleCount = Math.floor(lerp(3, 22, difficulty.value));
  const collectibleCount = Math.floor(lerp(12, 5, difficulty.value));

  return {
    index,
    type,
    length: 80,
    width,
    curve,
    slope: lerp(0.12, 0.32, difficulty.value),
    obstacles: generateObstacles(obstacleCount, width, rng),
    collectibles: generateCollectibles(collectibleCount, width, rng),
  };
}
```

---

## Movement-Modell

Für den MVP reicht ein vereinfachtes Physikmodell.

Der Ball hat:

- Position
- Velocity
- Acceleration
- Rotation
- Radius
- Grounded-State
- Speed-Multiplier

### Vereinfachte Logik

```js
velocity.z += gravityDownSlope * delta;
velocity.x += inputDirection * steeringForce * delta;
velocity.x *= lateralFriction;
velocity.z *= forwardFriction;

position.x += velocity.x * delta;
position.z += velocity.z * delta;
```

Die Strecke bewegt sich optisch nach oben beziehungsweise der Ball bewegt sich nach unten. Für Endless Games ist es oft einfacher, den Ball nahe am Ursprung zu halten und die Welt relativ zum Ball zu verschieben.

---

## Kamera

Die Kamera ist entscheidend für das Spielgefühl.

### Kamera-Stil

- leicht hinter dem Ball
- leicht erhöht
- schaut bergab
- zoomt bei hoher Geschwindigkeit etwas heraus
- leichte Verzögerung für Smoothness
- Screenshake bei Crashs
- FOV steigt bei Speed

### Beispiel

```js
camera.position.lerp(targetCameraPosition, 0.08);
camera.lookAt(ball.position.x, ball.position.y, ball.position.z - 20);

camera.fov = lerp(65, 82, speedNormalized);
camera.updateProjectionMatrix();
```

---

## Hindernisse

### Basishindernisse

- Felsen
- Eisblöcke
- Bäume
- Schneemänner
- Kristallspitzen
- Löcher im Boden
- bewegliche Schneewalzen
- Lawinenbrocken

### Hindernis-Regel

Jedes Hindernis muss früh genug sichtbar sein.  
Das Spiel darf schnell sein, aber nicht blind unfair.

---

## Collectibles

### Kristalle

Standard-Collectibles. Geben Punkte und halten Combos aktiv.

### Goldene Kristalle

Selten. Geben viele Punkte oder kurze Magnetwirkung.

### Flow-Orbs

Füllen den Flow Meter.

### Shield-Orbs

Schützen vor einem Treffer.

### Boost-Orbs

Geben kurzen Speed-Boost.

---

## Flow Meter

Der Flow Meter ist eine zentrale moderne Mechanik.

Er steigt durch:

- Kristalle in Folge
- Near Misses
- Sprünge
- perfekte Landungen
- lange Zeit ohne Crash
- hohe Geschwindigkeit

Wenn der Flow Meter voll ist, startet **Flow Mode**.

### Flow Mode Effekte

- Ball leuchtet
- Trail wird stärker
- Musik wird intensiver
- Score-Multiplikator steigt
- Steuerung fühlt sich etwas direkter an
- kleine Hindernisse können zerstört werden

Flow Mode dauert nur wenige Sekunden. Danach muss der Spieler ihn erneut aufbauen.

---

## Risiko-Belohnung-System

Der Spieler soll ständig kleine Entscheidungen treffen.

Beispiele:

- Sicherer breiter Weg oder enger Kristallpfad?
- Boost nehmen, obwohl danach eine Kurve kommt?
- Sprung über Abgrund wagen?
- Near Miss riskieren für Flow?

Gutes Endless-Design entsteht nicht durch Zufall, sondern durch Entscheidungen unter Druck.

---

## Biome

Die Strecke verändert sich visuell und mechanisch über Zeit.

### 1. Snowfield

- Startbiom
- breite Strecke
- klare Sicht
- einfache Hindernisse

### 2. Ice Canyon

- engere Strecke
- blaue Eiswände
- mehr Kurven
- rutschigere Flächen

### 3. Crystal Cave

- dunkler
- leuchtende Kristalle
- Tunnels
- viele Collectibles

### 4. Aurora Ridge

- Nachtstimmung
- Polarlichter
- schmale Bergkämme
- starker Speed-Fokus

### 5. Storm Peak

- Schneesturm
- schlechtere Sicht
- aggressive Hindernisse
- hohe Schwierigkeit

---

## Untergründe

Verschiedene Untergründe verändern das Fahrgefühl.

| Untergrund | Effekt |
|---|---|
| Schnee | normal |
| Eis | weniger Reibung, schneller, schwerer zu kontrollieren |
| Pulverschnee | bremst stark |
| Boost-Fläche | beschleunigt |
| Stein | lauter, weniger Kontrolle |
| Sprungfläche | katapultiert Ball nach oben |

---

## Game Over

Ein Run endet, wenn:

- der Ball in einen Abgrund fällt
- der Ball zu oft crasht
- die Lawine den Ball einholt
- der Ball zu lange außerhalb der Strecke ist

Für den MVP reicht:

> Game Over bei Absturz oder hartem Crash.

Später kann ein Lebenssystem ergänzt werden.

---

## Scoring

### Score-Formel

```txt
score = distanceScore + crystalScore + flowBonus + nearMissBonus + airtimeBonus
```

### Multiplikator

Der Combo-Multiplikator steigt durch gutes Spiel.

```txt
1x → 2x → 3x → 4x → 5x
```

Er fällt zurück auf 1x bei:

- Crash
- verpasster Combo-Zeit
- Verlassen der Strecke

---

## UI

Während des Runs:

- aktueller Score
- Distanz
- Geschwindigkeit
- Flow Meter
- Combo-Multiplikator
- bester Score als kleine Markierung

Nach dem Run:

- Score
- Distanz
- maximale Geschwindigkeit
- gesammelte Kristalle
- längste Combo
- neue Bestleistung
- Restart-Button

---

## Ghost-System

Nach jedem Run wird die beste Route gespeichert.

Der Ghost ist ein transparenter Ball, der den besten Run nachfährt.

Gespeichert werden:

- Position pro Zeitintervall
- Geschwindigkeit
- Seed
- Skin optional

Beispiel:

```js
const ghostFrame = {
  time: 12.48,
  position: { x: 2.1, y: 0.4, z: -840.0 },
  speed: 41.2,
};
```

---

## Daily Mountain

Jeden Tag gibt es eine feste Strecke mit gleichem Seed.

Beispiel:

```txt
daily-seed-2026-06-11
```

Alle Spieler fahren dieselbe prozedural generierte Strecke. Dadurch sind Leaderboards fair.

Daily Mountain Ziele:

- höchste Distanz
- höchster Score
- schnellste 1000 Meter
- beste Combo

---

## Visueller Stil

Empfohlen:

- Low-Poly
- klare Formen
- kräftige Farben
- viel Schneeweiß und Eisblau
- leuchtende Collectibles
- stylisierte Berge
- weiche Schatten
- Partikel statt Realismus

Three.js muss nicht fotorealistisch wirken. Das Spiel soll sofort lesbar sein.

### Effekte

- Snow trail hinter dem Ball
- Speed lines
- Kristall-Glow
- Screenshake
- FOV-Push bei hoher Geschwindigkeit
- Partikel bei Landung
- Explosion bei Crash
- Aurora-Skybox

---

## Audio

Audio ist wichtig für den Suchtfaktor.

Sounds:

- Rollgeräusch je nach Untergrund
- Kristall einsammeln
- Combo-Up
- Flow Mode Start
- Crash
- Jump
- Landing
- Wind bei hoher Geschwindigkeit

Musik:

- dynamischer Arcade-Track
- Intensität steigt mit Speed
- Filter oder zusätzliche Layer im Flow Mode

---

## MVP

Die erste Version sollte klein bleiben.

### MVP Features

- Three.js Szene
- Ball mit Bewegung
- Kamera folgt Ball
- endlose Chunk-Strecke
- einfache Hindernisse
- Kristalle zum Sammeln
- Score und Distanz
- Geschwindigkeit steigt mit Zeit
- Game Over bei Crash oder Absturz
- Restart

### Nicht im MVP

- Multiplayer
- Shop
- viele Biome
- perfekte Physik
- komplexe Animationen
- Account-System
- Online-Leaderboard

---

## Entwicklungsplan

### Phase 1: Spielgefühl

Ziel: Ball rollen lassen und Spaß testen.

Aufgaben:

- Three.js Projekt erstellen
- Ball rendern
- Kamera einbauen
- Input links/rechts
- Geschwindigkeit und Lenkung testen
- Strecke als einfache geneigte Plane

### Phase 2: Endless Strecke

Ziel: Prozedurale Chunks.

Aufgaben:

- Chunk-System bauen
- Chunks vor dem Spieler spawnen
- alte Chunks löschen
- Breite und Kurven variieren
- Abgrund links/rechts definieren

### Phase 3: Spielregeln

Ziel: Aus Demo wird Spiel.

Aufgaben:

- Hindernisse
- Collectibles
- Score
- Game Over
- Restart
- Speed-Ramp

### Phase 4: Juice

Ziel: Es soll sich gut anfühlen.

Aufgaben:

- Trails
- Partikel
- Sounds
- Screenshake
- Kamera-FOV bei Speed
- UI polish

### Phase 5: Retention

Ziel: Spieler kommen zurück.

Aufgaben:

- Highscore
- Ghost Run
- Daily Seed
- Skins
- Challenges

---

## Technische Architektur

### Mögliche Ordnerstruktur

```txt
src/
  main.js
  game/
    Game.js
    Input.js
    CameraController.js
    BallController.js
    ChunkManager.js
    ChunkGenerator.js
    DifficultyManager.js
    CollisionSystem.js
    ScoreManager.js
  objects/
    Ball.js
    Obstacle.js
    Collectible.js
    TerrainChunk.js
  effects/
    Particles.js
    ScreenShake.js
    Trails.js
  ui/
    HUD.js
    GameOverScreen.js
```

---

## Wichtige Balancing-Werte

```js
const CONFIG = {
  baseSpeed: 18,
  maxSpeed: 75,
  speedIncreasePerSecond: 0.12,
  steeringForce: 42,
  lateralFriction: 0.92,
  forwardFriction: 0.995,
  jumpForce: 12,
  gravity: 28,
  ballRadius: 1,
  chunkLength: 80,
  chunkWidthStart: 32,
  chunkWidthMin: 14,
};
```

Diese Werte sind Startpunkte. Das eigentliche Spielgefühl entsteht durch Playtesting.

---

## Erfolgsmetriken

Das Spiel funktioniert, wenn:

- ein Run innerhalb von 2 Sekunden neu gestartet werden kann
- der Spieler nach einem Crash versteht, warum er verloren hat
- die Steuerung nach 10 Sekunden verständlich ist
- der Spieler nach 3 Runs besser wird
- der Spieler freiwillig einen vierten Run startet

---

## Mögliche Namen

- Endless Mountain Ball
- Snowball Rush
- Slope Ball
- Glacier Ball
- Rolling Peak
- Avalanche Ball
- Mountain Roll
- Snowflow Ball
- Downhill Sphere
- Frostball Run

Favorit:

> **Snowball Rush**

Etwas cleaner und moderner:

> **Slope Ball**

---

## Wichtigste Design-Entscheidung

Das Spiel sollte nicht zu kompliziert werden.

Keine Story nötig.  
Keine langen Tutorials.  
Keine realistische Simulation.  
Kein Open-World-Anspruch.

Nur:

> **Ball. Berg. Speed. Highscore. Nochmal.**

---

## Ein-Satz-Vision

**Ein süchtig machender Three.js-Endless-Downhill-Runner, in dem du als Ball einen prozeduralen Berg hinunterrast, immer schneller wirst und versuchst, länger im Flow zu bleiben als beim letzten Run.**
