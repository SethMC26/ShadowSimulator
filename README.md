# Building Sun Shadow Simulator

A Three.js visualization tool that simulates how sunlight and shadows affect a building based on solar elevation and azimuth angles.

## Features

- **3D Building Model**: Interactive 3D rendering of a building with realistic shadows
- **Dynamic Sun Position**: Control the sun's position using elevation and azimuth angles
- **Wall Rotation**: Rotate the building to any orientation with wall azimuth control
- **Shadow Rendering**: Real-time shadow casting for accurate visualization
- **Cardinal Grid**: Visual reference grid showing North, South, East, West directions
- **GUI Controls**: Intuitive slider controls for all parameters

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server with Vite:
```bash
npx vite
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

4. To build for production:
```bash
npx vite build
```

## Usage

The GUI panel appears in the top-right corner with three sliders:

- **Elevation Angle** (0° - 360°): Height of the sun above the horizon
- **Azimuth** (0° - 360°): Direction of the sun (0° = North, 90° = East, 180° = South, 270° = West)
- **Wall Azimuth** (0° - 360°): Orientation of the building

## Controls

- **Mouse Drag**: Rotate camera (OrbitControls)
- **Scroll**: Zoom in/out
- **GUI Sliders**: Adjust sun and building parameters in real-time

## Technical Details

### Coordinate System
- **+X**: East
- **+Y**: Up
- **+Z**: South
- **-Z**: North

### Dependencies
- three.js: 3D graphics library
- lil-gui: GUI controls
- OrbitControls: Camera interaction

## Files

- `main.js`: Main application code
- `cardinalGrid.js`: Cardinal direction grid visualization
- `index.html`: HTML entry point
- `package.json`: Project dependencies

## README Author

GitHub Copilot
