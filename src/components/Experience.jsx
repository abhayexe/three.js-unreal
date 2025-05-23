import {
  Environment,
  OrthographicCamera,
  SoftShadows,
  OrbitControls,
} from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useRef, useState } from "react";
import { CharacterController } from "./CharacterController";
import { Map } from "./Map";
import { SSREffects } from "./SSREffects.tsx";
import Billboard from "./Billboard";
import { Lighting } from "./Lighting.tsx";
import { PostProcessing } from "./PostProcessing.tsx";
import { Effects } from "./Effects.tsx";

const maps = {
  newyork: {
    scale: 2,
    position: [0, 0, 0],
  },
  // city_time_square: {
  //   scale: 0.2,
  //   position: [0, 0, 0],
  // },
  // city_scene_tokyo: {
  //   scale: 1.72,
  //   position: [0, -1, -3.5],
  // },
  // mudscene: {
  //   scale: 0.1,
  //   position: [1,1,1],
  // },
  // city: {
  //   scale: 0.2,
  //   position: [0, 0, 0],
  // },
};

export const Experience = () => {
  const shadowCameraRef = useRef();
  const [map, setMap] = useState("newyork");

  return (
    <>
      {/* <OrbitControls /> */}
      <Environment 
      files="/city.hdr" 
      background 
      // preset="night" 
      />
      {/* <SoftShadows size={60} samples={16} focus={0.7} /> */}
      <SSREffects />

      <Billboard position={[9.*2, .636*2, 1.79*2]} rotation={[0, 3.1415976/2, 0]} scale ={[0.8*2,0.46*2,1*2]} video="./video1.mp4"/>
      <Billboard position={[10.9*2, 1.496*2, -2.92*2]} rotation={[0, 0.25318, 0]} scale ={[0.8*2,0.55*2,1]} video="./ad1.mp4"/>
      <Billboard position={[12.08*2, 1.145*2, -3.22*2]} rotation={[0, 0.25318, 0]} scale ={[0.8*1.8,0.55*1.34,1]} video="./gta.mp4"/>
      <Billboard position={[-6.2, 4, 1]} rotation={[0, 3.1415976/2, 0]} video="./ad2.mp4" />
      <fog attach="fog" color="#e1f7ff" near={1} far={150} />


      {/* <Effects /> */}
      {/* <PostProcessing /> */}
      <directionalLight
        intensity={0.6}
        color={"#ffdcbd"}
        castShadow
        position={[-10, 6, -0.4]} //-15, 10, 15//-10, 6, -0.4
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-22}
          right={15}
          top={10}
          bottom={-20}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
        />
      </directionalLight>

      {/* <ambientLight intensity={0.5} color={"#ffdcbd"} /> */}
      
      {/* <Lighting /> */}
        {/* <SoftShadows
          size={40} // Size of the shadow map (default: 10)
          focus={0.2} // Focus of the shadow (default: 0)
          samples={17} // Number of samples (default: 16)
        /> */}
      <Physics key={map}>
        <Map
          scale={maps[map].scale}
          position={maps[map].position}
          model={`models/${map}.glb`}
        />
        <CharacterController />
        {/* <OrbitControls
          target={[0, 0, 0]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI }
          // minPolarAngle={0.001}
          // maxPolarAngle={Math.PI - 0.001}
          minDistance={0.5}
          maxDistance={200}
          enablePan={true} 
          enableZoom={true}
          enableDamping={true}
          dampingFactor={0.09}
        /> */}
      </Physics>
    </>
  );
};
