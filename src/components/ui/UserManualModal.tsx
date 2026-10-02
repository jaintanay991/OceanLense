import { X } from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManualModal({ isOpen, onClose }: UserManualModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,240,255,0.15)] relative">
        
        <div className="flex-none p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl md:text-2xl font-bold tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            OCEANLENS — USER MANUAL
          </h2>
          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scientific-controls-scroll">
          <div className="max-w-3xl mx-auto space-y-10 text-white/80 leading-relaxed text-sm md:text-base">
            
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">1. About OceanLens</h3>
              <p>OceanLens is an interactive 3D ocean visualization platform that turns complex oceanographic information into an easy-to-explore digital ocean.</p>
              <p>Instead of viewing ocean data only through traditional tables, graphs or static maps, OceanLens allows users to explore the Earth as an interactive 3D globe and investigate ocean conditions through different variables, locations and depths.</p>
              <p>The platform is designed around four ideas:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li><strong className="text-white">Learn</strong> → understand ocean parameters</li>
                <li><strong className="text-white">Explore</strong> → navigate oceans, seas and depths</li>
                <li><strong className="text-white">Visualize</strong> → see scientific data in 3D</li>
                <li><strong className="text-white">Understand</strong> → interpret patterns and ocean conditions</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">2. Getting Started</h3>
              <p>When you open OceanLens, you are presented with an interactive 3D Earth.</p>
              <p className="font-medium text-white/90">Basic globe controls</p>
              <p>You can:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Rotate the globe by dragging with the mouse.</li>
                <li>Zoom in and out using the mouse wheel.</li>
                <li>Move around the globe to inspect different ocean regions.</li>
                <li>Navigate between different oceans and selected seas.</li>
                <li>Return to the global view when required.</li>
              </ul>
              <p>The 3D environment is designed to provide geographical context while scientific information is displayed over the ocean surface.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">3. Ocean Explorer</h3>
              <p>OceanLens allows you to explore major ocean regions directly through the interface.</p>
              <p>The platform includes the five major oceans:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Pacific Ocean</li>
                <li>Atlantic Ocean</li>
                <li>Indian Ocean</li>
                <li>Southern Ocean</li>
                <li>Arctic Ocean</li>
              </ul>
              <p>It also provides access to selected seas and regional areas such as:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70 grid grid-cols-2 gap-x-4">
                <li>Arabian Sea</li>
                <li>Bay of Bengal</li>
                <li>Mediterranean Sea</li>
                <li>Red Sea</li>
                <li>Caribbean Sea</li>
                <li>South China Sea</li>
                <li>North Sea</li>
                <li>Baltic Sea</li>
              </ul>
              <p>Selecting an ocean or sea changes the exploration view so that users can focus on a particular geographical region.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">4. Scientific Variables</h3>
              <p>OceanLens allows users to switch between different ocean parameters.</p>
              
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-white/90">Temperature</h4>
                <p>Temperature represents the thermal state of seawater.</p>
                <p>It helps users understand:</p>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>Warm and cold water regions</li>
                  <li>Surface temperature distribution</li>
                  <li>Vertical temperature changes</li>
                  <li>Ocean thermal structure</li>
                </ul>
                <p>Temperature is particularly useful when studying features such as the thermocline and ocean stratification.</p>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-white/90">Salinity</h4>
                <p>Salinity represents the concentration of dissolved salts in seawater.</p>
                <p>It can be used to investigate:</p>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>Differences between water masses</li>
                  <li>Freshwater influence</li>
                  <li>Ocean circulation patterns</li>
                  <li>Vertical changes in seawater properties</li>
                </ul>
                <p>Together, temperature and salinity provide important information about the physical characteristics of seawater.</p>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-white/90">Ocean Currents</h4>
                <p>The Currents visualization represents ocean-water movement using directional flow information.</p>
                <p>Currents are important for understanding:</p>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>Large-scale ocean circulation</li>
                  <li>Transport of heat</li>
                  <li>Movement of water masses</li>
                  <li>Regional circulation patterns</li>
                </ul>
                <p>The visualization helps users interpret the direction and behaviour of ocean circulation spatially.</p>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-white/90">Chlorophyll</h4>
                <p>Chlorophyll is an important ocean-colour indicator associated with phytoplankton biomass.</p>
                <p>Higher chlorophyll concentrations can generally indicate regions with greater phytoplankton presence.</p>
                <p>OceanLens provides a dedicated Chlorophyll visualization so users can investigate its spatial distribution across the ocean.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">5. Depth Exploration</h3>
              <p>One of the important features of OceanLens is the ability to investigate the ocean vertically.</p>
              <p>The ocean is not the same from the surface to the deep ocean. Temperature, salinity and other properties can change significantly with depth.</p>
              <p>The depth control allows users to move through different vertical levels and investigate how ocean conditions change below the surface.</p>
              <p>This is particularly useful for studying:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Surface conditions</li>
                <li>Subsurface layers</li>
                <li>Thermocline</li>
                <li>Mixed-layer structure</li>
                <li>Deep-ocean conditions</li>
              </ul>
              <p>The idea is to treat the ocean as a three-dimensional volume rather than simply a two-dimensional surface.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">6. Cursor Tracker</h3>
              <p>The cursor tracker provides an interactive way to inspect ocean information at a particular location.</p>
              <p>When you move the cursor over the visualization, the interface can provide information associated with the selected location and currently active variable.</p>
              <p>This makes it possible to move from:</p>
              <p className="italic text-cyan-400 pl-4">“Where is this pattern?”</p>
              <p>to:</p>
              <p className="italic text-cyan-400 pl-4">“What value is present at this location?”</p>
              <p>The cursor-based interaction is especially useful when investigating temperature, salinity and other scientific layers.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">7. Scientific Color Visualization</h3>
              <p>OceanLens uses color gradients to represent variations in scientific parameters.</p>
              <p>For example:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li><strong className="text-white">Temperature</strong> → temperature-based color scale</li>
                <li><strong className="text-white">Salinity</strong> → salinity-based color scale</li>
                <li><strong className="text-white">Chlorophyll</strong> → chlorophyll concentration visualization</li>
                <li><strong className="text-white">Currents</strong> → directional/flow visualization</li>
              </ul>
              <p>The color legend provides context for interpreting the displayed values.</p>
              <p className="font-medium text-cyan-400">Users should always refer to the displayed legend and units rather than interpreting color alone.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">8. Time Exploration</h3>
              <p>Oceanographic conditions change with time.</p>
              <p>OceanLens provides a time-oriented visualization workflow so users can explore available temporal data and investigate how ocean conditions evolve.</p>
              <p>This can help reveal:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Seasonal changes</li>
                <li>Temporal variability</li>
                <li>Movement of ocean features</li>
                <li>Changes in temperature and salinity</li>
                <li>Evolution of ocean conditions</li>
              </ul>
              <p>The available temporal resolution depends on the underlying dataset.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">9. Model vs Observation</h3>
              <p>OceanLens includes a Model vs Observation concept for comparing numerical ocean information with observational measurements.</p>
              
              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-white/90">Model</h4>
                <p>A numerical ocean model represents ocean conditions computationally using mathematical and physical equations.</p>
                <p>Models can generate fields such as:</p>
                <ul className="list-disc pl-5 space-y-1 text-white/70">
                  <li>Temperature</li>
                  <li>Salinity</li>
                  <li>Currents</li>
                  <li>Other ocean variables</li>
                </ul>
              </div>

              <div className="space-y-2 mt-4">
                <h4 className="font-medium text-white/90">Observation</h4>
                <p>Observations are measurements collected from real ocean environments using instruments and observing platforms.</p>
                <p>OceanLens brings these two perspectives together so users can investigate how modeled ocean conditions relate to measured observations.</p>
                <p>This is important because ocean models need observations for evaluation, validation and improvement.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">10. What are Argo Floats?</h3>
              <p>Argo floats are autonomous robotic instruments used to collect observations from inside the ocean.</p>
              <p>A typical Core Argo float measures:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Temperature</li>
                <li>Salinity</li>
                <li>Pressure/depth</li>
              </ul>
              <p>Argo floats move vertically through the water column and periodically return toward the surface to transmit their measurements. The global Argo system provides large-scale subsurface observations, with Core Argo profiling generally reaching around 2,000 metres.</p>
              
              <h4 className="font-medium text-white/90 mt-4">How an Argo float works</h4>
              <p>A simplified cycle is:</p>
              <ol className="list-decimal pl-5 space-y-1 text-white/70">
                <li>The float descends below the ocean surface.</li>
                <li>It collects measurements while profiling through the water column.</li>
                <li>It changes its buoyancy to rise.</li>
                <li>It reaches the surface.</li>
                <li>Measurements are transmitted.</li>
                <li>The cycle repeats.</li>
              </ol>
              <p>This creates vertical profiles of ocean conditions.</p>
              <p>Argo is therefore extremely useful for understanding what is happening beneath the ocean surface rather than only observing the surface.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">11. What is BGC-Argo?</h3>
              <p>BGC stands for Biogeochemical.</p>
              <p>BGC-Argo extends the capabilities of conventional Argo floats by adding sensors for additional ocean properties.</p>
              <p>Depending on the float, BGC observations can include:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Dissolved oxygen</li>
                <li>Nitrate</li>
                <li>pH</li>
                <li>Chlorophyll-a</li>
                <li>Backscatter</li>
                <li>Irradiance</li>
              </ul>
              <p>These measurements help researchers study not only the physical ocean but also biological and chemical processes.</p>
              <p>For OceanLens, BGC observations are particularly relevant to understanding parameters such as chlorophyll and broader ocean ecosystem conditions.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">12. What are Ocean Gliders?</h3>
              <p>Ocean gliders are autonomous underwater vehicles that collect observations while moving through the ocean.</p>
              <p>Unlike a conventional powered underwater vehicle, a profiling glider primarily uses changes in buoyancy to move vertically and convert that motion into forward movement.</p>
              <p>Gliders can collect measurements such as:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Temperature</li>
                <li>Salinity</li>
                <li>Pressure/depth</li>
                <li>Current-related information</li>
                <li>Other environmental parameters depending on their sensors</li>
              </ul>
              <p>They can operate for days to months while repeatedly profiling the water column.</p>
              
              <h4 className="font-medium text-white/90 mt-4">Why Gliders are useful</h4>
              <p>Gliders can provide detailed observations along their trajectory.</p>
              <p>This makes them useful for studying:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Coastal regions</li>
                <li>Ocean fronts</li>
                <li>Water-column structure</li>
                <li>Temperature and salinity variations</li>
                <li>Ocean circulation</li>
              </ul>
              <p>They complement other observing systems such as Argo floats, research vessels and fixed instruments.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">13. Argo vs Glider</h3>
              <div className="overflow-x-auto mt-4 mb-4">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-cyan-500/30 text-cyan-400">
                      <th className="py-3 px-4 font-semibold">Feature</th>
                      <th className="py-3 px-4 font-semibold">Argo Float</th>
                      <th className="py-3 px-4 font-semibold">Ocean Glider</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white/90">Movement</td>
                      <td className="py-3 px-4">Drifts with ocean currents</td>
                      <td className="py-3 px-4">Moves autonomously along a trajectory</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white/90">Main purpose</td>
                      <td className="py-3 px-4">Broad ocean monitoring</td>
                      <td className="py-3 px-4">Detailed regional/trajectory observations</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white/90">Vertical profiling</td>
                      <td className="py-3 px-4">Yes</td>
                      <td className="py-3 px-4">Yes</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white/90">Temperature</td>
                      <td className="py-3 px-4">Yes</td>
                      <td className="py-3 px-4">Yes</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white/90">Salinity</td>
                      <td className="py-3 px-4">Yes</td>
                      <td className="py-3 px-4">Yes</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white/90">Typical use</td>
                      <td className="py-3 px-4">Global-scale observations</td>
                      <td className="py-3 px-4">Regional/high-resolution observations</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-medium text-white/90">Operation</td>
                      <td className="py-3 px-4">Autonomous</td>
                      <td className="py-3 px-4">Autonomous</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-cyan-900/20 border border-cyan-500/20 rounded-lg p-4 mt-6">
                <p className="font-medium text-cyan-400 mb-2">In simple words:</p>
                <p>Argo gives us a broad picture of the ocean.</p>
                <p>Gliders can provide detailed observations along specific paths.</p>
                <p className="mt-2 text-white">Together, they provide complementary information about the ocean.</p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">14. CTD — What is it?</h3>
              <p>CTD stands for:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Conductivity</li>
                <li>Temperature</li>
                <li>Depth</li>
              </ul>
              <p>A CTD instrument measures the physical properties of seawater.</p>
              <p>Its measurements can be used to derive or analyze:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>Temperature</li>
                <li>Salinity</li>
                <li>Pressure/depth</li>
              </ul>
              <p>CTDs are commonly used during oceanographic surveys from research vessels and other platforms.</p>
              <p>In an OceanLens-style multi-source system, CTD observations can complement autonomous observations such as Argo and Gliders.</p>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">15. Why Combine Argo, Gliders and CTD?</h3>
              <p>Each observing platform provides a different perspective.</p>
              <ul className="space-y-2 mt-2">
                <li><strong className="text-cyan-400">Argo</strong> → broad and repeated global subsurface observations.</li>
                <li><strong className="text-cyan-400">Gliders</strong> → detailed measurements along specific trajectories.</li>
                <li><strong className="text-cyan-400">CTD</strong> → high-quality ship-based profiles and targeted surveys.</li>
                <li><strong className="text-cyan-400">Ocean models</strong> → continuous spatial fields generated computationally.</li>
              </ul>
              <p className="mt-4">Combining these sources provides a richer picture of the ocean than relying on a single observation system.</p>
            </section>

            <section className="space-y-3 pb-8">
              <h3 className="text-lg font-semibold text-white tracking-wide border-l-2 border-cyan-500 pl-3">16. Ocean Data Sources in the Project</h3>
              <p>The repository contains project resources and scripts associated with multiple ocean-data workflows, including:</p>
              <ul className="list-disc pl-5 space-y-1 text-white/70">
                <li>INCOIS-related data</li>
                <li>WOA-related data</li>
                <li>Chlorophyll data</li>
                <li>ERDDAP dataset information</li>
              </ul>
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
}
