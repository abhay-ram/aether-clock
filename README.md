# Fluid Sphere Wallpaper

This project recreates a fluid, swirling sphere wallpaper using Vite, React, and Three.js (via React Three Fiber).

## Features

- **Dynamic Animation**: The fluid pattern swirls and evolves over time using a custom GLSL shader.
- **Customizable**: Press `c` or `Ctrl+K` to open the customization menu.
  - **Color Schemes**: Generate harmonious palettes or pick individual colors.
  - **Geometry**: Adjust the sphere's position and size.
  - **Clock**: Customize the clock's position, size, and color.
  - **Rotation**: Enable/disable rotation and adjust speed.
- **Persistent Settings**: Your customizations are saved automatically.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Deployment

To deploy to GitHub Pages:

1.  Ensure your project is initialized as a git repository and pushed to GitHub.
2.  Run the deploy script:
    ```bash
    npm run deploy
    ```
    This will build the project and push the `dist` folder to the `gh-pages` branch.

## Technologies

-   [Vite](https://vitejs.dev/)
-   [React](https://reactjs.org/)
-   [Three.js](https://threejs.org/)
-   [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
-   [tinycolor2](https://github.com/bgrins/TinyColor)
