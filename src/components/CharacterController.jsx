import { useKeyboardControls, OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useRef, useState } from "react";
import { MathUtils, Vector3 } from "three";
import { Character } from "./Character";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export const CharacterController = () => {
  const WALK_SPEED = 0.8;
  const RUN_SPEED = 1.6;

  const rb = useRef();
  const container = useRef();
  const character = useRef();
  const orbitControls = useRef();

  const [animation, setAnimation] = useState("idle");
  const characterWorldPos = useRef(new Vector3());
  const [, get] = useKeyboardControls();

  useFrame(() => {
    if (rb.current) {
      const vel = rb.current.linvel();
      const angle = orbitControls.current
        ? -orbitControls.current.getAzimuthalAngle()
        : 0;

      // Initialize movement vector
      const movement = {
        x: 0,
        z: 0,
      };

      // Get movement input
      if (get().forward) movement.z = -1;
      if (get().backward) movement.z = 1;
      if (get().left) movement.x = -1;
      if (get().right) movement.x = 1;

      // Set movement speed
      const speed = get().run ? RUN_SPEED : WALK_SPEED;

      // Calculate movement relative to camera angle
      if (movement.x !== 0 || movement.z !== 0) {
        // Normalize diagonal movement
        const length = Math.sqrt(
          movement.x * movement.x + movement.z * movement.z
        );
        movement.x /= length;
        movement.z /= length;

        // Rotate movement vector by camera angle
        const rotatedX =
          movement.x * Math.cos(angle) - movement.z * Math.sin(angle);
        const rotatedZ =
          movement.x * Math.sin(angle) + movement.z * Math.cos(angle);

        // Apply movement
        vel.x = rotatedX * speed;
        vel.z = rotatedZ * speed;

        // Update character rotation to face movement direction
        const targetRotation = Math.atan2(rotatedX, rotatedZ);
        character.current.rotation.y = MathUtils.lerp(
          character.current.rotation.y,
          targetRotation,
          0.15
        );

        // Set animation based on speed
        setAnimation(speed === RUN_SPEED ? "run" : "walk");
      } else {
        vel.x = 0;
        vel.z = 0;
        setAnimation("idle");
      }

      rb.current.setLinvel(vel, true);

      // Update camera target position to follow character
      if (container.current) {
        container.current.getWorldPosition(characterWorldPos.current);
        orbitControls.current?.target.lerp(characterWorldPos.current, 0.1);
      }
    }
  });

  return (
    <>
      <OrbitControls
        ref={orbitControls}
        target={[0, -1, 0]}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        // minPolarAngle={0.001}
        // maxPolarAngle={Math.PI - 0.001}
        minDistance={1.5}
        maxDistance={4}
        enablePan={false} //false
        enableZoom={true}
        enableDamping={true}
        dampingFactor={0.09}
      />

      <RigidBody position={[0, 10, 0]} colliders={false} lockRotations ref={rb}>
        <group ref={container}>
          <group ref={character}>
            <Character scale={0.18} position-y={-0.235} animation={animation} />
            {/* 0.08 */}
          </group>
        </group>
        <CapsuleCollider args={[0.08, 0.15]} />
        {/* 0.08, 0.163 */}
      </RigidBody>
    </>
  );
};
