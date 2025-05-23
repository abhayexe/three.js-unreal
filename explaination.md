# r3f-3rd-person-controller-final-main Codebase Explanation

This project is a 3D third-person character controller built with React Three Fiber (R3F), leveraging Three.js, @react-three/drei, @react-three/rapier, and Leva for UI controls. The codebase is modular, separating concerns into components for the character, map, experience setup, and controller logic. Below is a detailed explanation of each part:

---

## 1. App.jsx

- **Purpose:** Entry point of the React app. Sets up keyboard controls and the 3D canvas.
- **Key Features:**
  - Uses `KeyboardControls` from @react-three/drei to map keyboard keys to movement actions (forward, backward, left, right, run).
  - Renders a `Canvas` (from @react-three/fiber) with shadows and a preset camera.
  - Sets a background color and renders the `Experience` component, which contains the main 3D scene.

---

## 2. Experience.jsx

- **Purpose:** Sets up the 3D environment, lighting, physics, and loads the map and character controller.
- **Key Features:**
  - Uses Leva's `useControls` to allow dynamic map selection from a UI panel.
  - Sets up an environment preset (sunset) and a directional light with shadow settings.
  - Uses an orthographic camera for shadow mapping.
  - Wraps the scene in a `Physics` provider (from @react-three/rapier) to enable physics simulation.
  - Loads the selected map model and the character controller.

---

## 3. Map.jsx

- **Purpose:** Loads and displays a GLTF map model, making it a static physics object.
- **Key Features:**
  - Loads a GLTF model using `useGLTF`.
  - Sets all meshes in the model to cast and receive shadows.
  - Optionally plays the first animation if present.
  - Wraps the model in a `RigidBody` (type fixed, colliders trimesh) for static collision.

---

## 4. Character.jsx

- **Purpose:** Loads and displays the animated character model.
- **Key Features:**
  - Loads a GLTF character model and its animations.
  - Uses `useAnimations` to control which animation is playing (idle, walk, run, etc.).
  - Switches animation based on the `animation` prop.
  - Sets up skinned meshes for body parts, enabling shadows.

---

## 5. CharacterController.jsx

- **Purpose:** Implements the logic for character movement, rotation, animation switching, and camera following.
- **Key Features:**
  - Uses Leva controls for tuning walk speed, run speed, and rotation speed.
  - Handles keyboard and mouse/touch input for movement and rotation.
  - Calculates movement direction and speed, applies it to the character's physics body.
  - Smoothly interpolates character and camera rotation/position for a polished feel.
  - Switches character animation state based on movement (idle, walk, run).
  - Sets up a capsule collider for the character.

---

## 6. Models and Assets

- **Location:** `public/models/`
- **Purpose:** Contains GLTF files for the character and various maps. These are loaded dynamically based on user selection.

---

## 7. Other Files

- **index.html, main.jsx, index.css:** Standard React/Vite entry files and global styles.
- **vite.config.js:** Vite configuration for fast development and build.
- **package.json:** Lists dependencies, including React, R3F, Drei, Rapier, Leva, and Three.js.

---

## 8. How It Works (Flow)

1. **App.jsx** sets up keyboard controls and the 3D canvas.
2. **Experience.jsx** configures the environment, lighting, and physics, and loads the map and character controller.
3. **Map.jsx** loads the selected map model and makes it a static physics object.
4. **CharacterController.jsx** manages user input, character movement, animation, and camera following.
5. **Character.jsx** renders the animated character model.

---

## 9. Key Libraries Used

- **@react-three/fiber:** React renderer for Three.js.
- **@react-three/drei:** Useful helpers for R3F (controls, loaders, etc.).
- **@react-three/rapier:** Physics engine integration.
- **Leva:** UI controls for tweaking parameters live.
- **Three.js:** Core 3D rendering library.

---

## 10. Customization

- **Maps:** Easily add new maps by placing GLTF files in `public/models/` and updating the `maps` object in `Experience.jsx`.
- **Character:** Replace or update the character model/animations in `public/models/character.glb`.
- **Controls:** Adjust movement/rotation speeds via the Leva UI or by changing defaults in `CharacterController.jsx`.

---

## 11. Summary

This codebase provides a modular, extensible foundation for a 3D third-person controller in React. It demonstrates best practices for combining R3F, physics, animation, and user input, and is easily customizable for different maps, characters, and control schemes.
