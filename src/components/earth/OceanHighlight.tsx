import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AppState } from '../../types';
import { OCEANS } from '../../data/oceans';

interface OceanHighlightProps {
  appState: AppState;
}

export function OceanHighlight({ appState }: OceanHighlightProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const targetUniforms = useMemo(() => ({
    opacity: 0,
    bounds: new THREE.Vector4(0, 0, 0, 0), // minLat, maxLat, minLon, maxLon
    color: new THREE.Color('#00f0ff')
  }), []);

  const uniforms = useMemo(() => ({
    uOpacity: { value: 0 },
    uBounds: { value: new THREE.Vector4(0, 0, 0, 0) },
    uColor: { value: new THREE.Color('#00f0ff') },
    uTime: { value: 0 }
  }), []);

  useFrame((_state, delta) => {
    if (materialRef.current) {
      uniforms.uTime.value += delta;
      
      let isVisible = false;
      let targetBounds = new THREE.Vector4(0, 0, 0, 0);

      if (appState.activeRegionType === 'OCEAN' && appState.activeOceanId) {
        isVisible = true;
        const ocean = OCEANS[appState.activeOceanId];
        targetBounds.set(ocean.bounds[0], ocean.bounds[1], ocean.bounds[2], ocean.bounds[3]);
        targetUniforms.color.set('#00f0ff');
      } else if (appState.activeRegionType === 'SEA' && appState.activeSeaId && appState.activeOceanId) {
        isVisible = true;
        const sea = OCEANS[appState.activeOceanId].majorSeas.find(s => s.id === appState.activeSeaId);
        if (sea) {
          // Approximate a small box around the sea coordinate
          targetBounds.set(sea.coordinates[0] - 8, sea.coordinates[0] + 8, sea.coordinates[1] - 8, sea.coordinates[1] + 8);
          targetUniforms.color.set('#3b82f6');
        }
      }

      targetUniforms.opacity = isVisible ? 0.3 : 0.0;
      targetUniforms.bounds.lerp(targetBounds, delta * 3.0);

      uniforms.uOpacity.value = THREE.MathUtils.lerp(uniforms.uOpacity.value, targetUniforms.opacity, delta * 4.0);
      uniforms.uBounds.value.copy(targetUniforms.bounds);
      uniforms.uColor.value.lerp(targetUniforms.color, delta * 4.0);
    }
  });

  return (
    <mesh>
      {/* Slightly larger than earth radius 2 */}
      <sphereGeometry args={[2.02, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uOpacity;
          uniform vec4 uBounds; // minLat, maxLat, minLon, maxLon
          uniform vec3 uColor;
          varying vec2 vUv;

          // https://iquilezles.org/articles/distfunctions2d/
          float sdBox( in vec2 p, in vec2 b ) {
              vec2 d = abs(p)-b;
              return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
          }

          void main() {
            // vUv.x: 0 to 1 maps to lon -180 to 180 (Wait, standard threejs sphere: x=0 is lon -180?)
            // Actually, UV mapping is x=0 -> lon=-180, x=1 -> lon=180.
            // y=0 -> lat=-90, y=1 -> lat=90.
            float lon = (vUv.x - 0.5) * 360.0;
            float lat = (vUv.y - 0.5) * 180.0;

            float minLat = uBounds.x;
            float maxLat = uBounds.y;
            float minLon = uBounds.z;
            float maxLon = uBounds.w;

            // Soft edges
            float edge = 5.0; // degrees

            float latDist = min(lat - minLat, maxLat - lat);
            float latAlpha = smoothstep(-edge, edge, latDist);

            float lonDist;
            // Handle antimeridian crossing (if minLon > maxLon)
            if (minLon > maxLon) {
               if (lon > minLon) {
                   lonDist = min(lon - minLon, 180.0 - lon);
               } else if (lon < maxLon) {
                   lonDist = min(lon - (-180.0), maxLon - lon);
               } else {
                   lonDist = -10.0; // outside
               }
            } else {
               lonDist = min(lon - minLon, maxLon - lon);
            }
            float lonAlpha = smoothstep(-edge, edge, lonDist);

            float alpha = latAlpha * lonAlpha * uOpacity;
            
            // Add slight scanning/glow effect based on lat
            float scan = sin(lat * 5.0) * 0.1 + 0.9;
            
            if (alpha <= 0.01) discard;

            gl_FragColor = vec4(uColor * scan, alpha * 0.5);
          }
        `}
      />
    </mesh>
  );
}
