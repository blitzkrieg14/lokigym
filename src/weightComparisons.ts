export interface WeightComparison {
  item: string;
  emoji: string;
  description: string;
}

interface WeightComparisonTemplate {
  item: string;
  emoji: string;
  template: string;
}

interface WeightCategory {
  limit: number;
  comparisons: WeightComparisonTemplate[];
}

const CATEGORIES: WeightCategory[] = [
  // 1. weight <= 0 (limit: 0)
  {
    limit: 0,
    comparisons: [
      { item: "a feather", emoji: "🪶", template: "You focused purely on bodyweight or dynamic movements this time. Perfect for master-level control!" },
      { item: "a single helium balloon", emoji: "🎈", template: "Zero gravity mode activated. Mass who? You drifted through this workout like a dream." },
      { item: "a dry autumn leaf", emoji: "🍂", template: "Gravity is strictly optional. Your muscles are basically floating on a gentle, cool breeze." },
      { item: "a piece of pocket lint", emoji: "💨", template: "Is that a workout or did someone just sneeze? Absolute speed, zero friction." },
      { item: "a fluffy cloud", emoji: "☁️", template: "Light as air, fluffy as a marshmallow. Your joints are writing you a thank-you letter." },
      { item: "a workout ghost", emoji: "👻", template: "Completely weightless! You spooked the iron by not even touching it today." },
      { item: "an imaginary barbell", emoji: "🏋️", template: "Perfect form, infinite reps, absolute zero load. Nobody can call you out on bad technique!" },
      { item: "a single grain of sand", emoji: "⏳", template: "Start small, think big. Remember, every massive mountain was once just sand!" },
      { item: "a passing thought", emoji: "💭", template: "Weighs absolutely nothing but can feel heavy on the brain. A pure psychological pump." },
      { item: "the speed of light", emoji: "⚡", template: "You moved so fast, mass didn't even have time to accumulate. Fast, furious, and weightless." },
      { item: "a dandelion seed", emoji: "🌱", template: "Floating along on your own potential. A beautiful, breezy, weight-free session." },
      { item: "a glowing soap bubble", emoji: "🫧", template: "Pop! That is the sound of gravity completely disappearing from your workout." },
      { item: "a laser beam", emoji: "🔦", template: "Pure concentrated energy, zero physical mass. Cutting through the training atmosphere!" },
      { item: "a quiet whisper", emoji: "🗣️", template: "Silent, light, yet incredibly powerful in its intention. Lungs are working, gravity is resting." },
      { item: "your own shadow", emoji: "👤", template: "Moving alongside the weights but keeping it strictly phantom. Smooth, silent speed." },
      { item: "a single snowflake", emoji: "❄️", template: "Gentle, cold-blooded precision. Floating onto the workout canvas without any heavy impact." },
      { item: "a spiderweb strand", emoji: "🕸️", template: "Weighs next to nothing but has world-class tensile strength. You're building a resilient web!" },
      { item: "a sweet memory", emoji: "🧠", template: "Weighs nothing at all but hits you like a freight train. Pure neurological adaptation!" },
      { item: "a quantum photon", emoji: "🪐", template: "Quantum state of weightlifting. You exist in all lift states simultaneously today." },
      { item: "a paper airplane", emoji: "✈️", template: "Smooth aerodynamics. You glided through today's dynamic circuits with absolute style." }
    ]
  },
  // 2. weight < 150 (limit: 150)
  {
    limit: 150,
    comparisons: [
      { item: "a Giant Pacific Octopus", emoji: "🐙", template: "You moved a cumulative total of {weight} lbs! That is equivalent to hoisting a full-grown Giant Pacific Octopus out of the deep ocean." },
      { item: "a very fat trash raccoon", emoji: "🦝", template: "You lifted a cumulative {weight} lbs! That is equivalent to a chunky trash panda who has been hitting the buffet behind the bakery." },
      { item: "a newborn baby giraffe", emoji: "🦒", template: "A solid {weight} lbs moved! That matches a newborn giraffe who is still figuring out how to coordinate its long legs." },
      { item: "a heavy bag of premium dog food", emoji: "🐕", template: "You pushed {weight} lbs! That is enough high-quality kibble to feed a hungry Mastiff for several days." },
      { item: "a classic acoustic guitar collection", emoji: "🎸", template: "You hoisted {weight} lbs! That matches lifting about 15 Gibson Les Pauls all tuned up and ready to rock." },
      { item: "a golden retriever refusing to walk", emoji: "🦮", template: "You lifted a stubborn {weight} lbs. That is equivalent to deadlifting an adult Golden Retriever who has declared naptime on the sidewalk." },
      { item: "a medieval suit of plate armor", emoji: "🛡️", template: "You pressed {weight} lbs! You've officially hoisted the weight of a full suit of knightly battle armor." },
      { item: "ten heavy-duty bowling balls", emoji: "🎳", template: "You accumulated {weight} lbs of total volume! That's like lifting 10 professional-grade bowling balls at once." },
      { item: "a high-end espresso machine", emoji: "☕", template: "Lifting {weight} lbs is like moving a commercial Italian espresso bar machine. Think of the caffeine-infused gains!" },
      { item: "a standard keg of draft beer", emoji: "🍺", template: "You hoisted {weight} lbs. Whether you view it as half-full or half-empty, it's a solid party-starting weight." },
      { item: "a massive wheel of Parmesan cheese", emoji: "🧀", template: "You pumped {weight} lbs! Pasta night is saved, and your arms are officially shredded." },
      { item: "a complete vintage set of encyclopedias", emoji: "📚", template: "You moved {weight} lbs! Lifting deep academic knowledge the old-fashioned, high-strain way." },
      { item: "a hyperactive toddler throwing a tantrum", emoji: "👶", template: "Lifting {weight} lbs is exactly like trying to carry a wriggling toddler out of the toy aisle." },
      { item: "a massive wicker basket of fresh coconuts", emoji: "🥥", template: "You lifted {weight} lbs! That's a full harvest of tropical coconuts ready for hydration." },
      { item: "a heavy vintage typewriter", emoji: "⌨️", template: "You pushed {weight} lbs. That's a classic cast-iron Underwood typewriter ready to hammer out legendary stories." },
      { item: "a giant state-fair prize pumpkin", emoji: "🎃", template: "You hoisted {weight} lbs! That's a massive pumpkin ready to be turned into a giant carriage or lots of pies." },
      { item: "a commercial-grade microwave oven", emoji: "🔌", template: "You pushed {weight} lbs! That is equivalent to lifting a heavy kitchen microwave at maximum voltage." },
      { item: "a collection of 100 vinyl records", emoji: "💿", template: "You lifted {weight} lbs! That is equivalent to moving a crate filled with heavy-duty retro records." },
      { item: "a pirate chest of silver coins", emoji: "🪙", template: "Shiver me timbers! You hoisted {weight} lbs of pure silver coins and iron locks." },
      { item: "a chubby sleeping English Bulldog", emoji: "🐶", template: "You moved {weight} lbs! That is like trying to carry a snoring bulldog who has melted into the couch." }
    ]
  },
  // 3. weight < 350 (limit: 350)
  {
    limit: 350,
    comparisons: [
      { item: "a wild giant panda", emoji: "🐼", template: "You accumulated {weight} lbs of raw steel-pumping volume! That is roughly the weight of a giant panda munching on organic bamboo." },
      { item: "a high-stakes casino roulette table", emoji: "🎰", template: "You lifted {weight} lbs! That matches the weight of a heavy casino roulette wheel and oak table. Place your bets on gains!" },
      { item: "a cute newborn baby hippo", emoji: "🦛", template: "You pushed a total of {weight} lbs! That's equivalent to lifting a surprisingly dense little river monster." },
      { item: "a full water cooler jug stack", emoji: "🪣", template: "You hoisted {weight} lbs. That's enough high-purity water to keep an entire office gossip circle hydrated for weeks." },
      { item: "a sumo wrestler's snack cabinet", emoji: "🍱", template: "You moved {weight} lbs! Extremely dense with high-calorie fuel and pickled plums." },
      { item: "a massive iron-bound pirate chest", emoji: "🏴‍☠️", template: "You lifted {weight} lbs! You've successfully raised a heavy chest filled with Spanish gold doubloons." },
      { item: "a classic Vespa scooter", emoji: "🛵", template: "You pressed {weight} lbs! You're officially lifting a classic Italian Vespa scooter off the Roman streets." },
      { item: "a full set of heavy cast-iron skillets", emoji: "🍳", template: "You hoisted {weight} lbs! That's enough heavy cast iron to cook a grand breakfast feast for an entire Viking clan." },
      { item: "a double-door refrigerator door", emoji: "🚪", template: "You accumulated {weight} lbs! That is like lifting a kitchen fridge door packed with meal prep containers." },
      { item: "an adult mountain goat", emoji: "🐐", template: "You lifted {weight} lbs. That's a rugged, nimble mountain goat who laughs at steep mountain cliffs." },
      { item: "a massive stack of truck tires", emoji: "🛞", template: "You hoisted {weight} lbs! That's a full stack of heavy rubber treads ready for a race track pit stop." },
      { item: "a wooden chest of historic artifacts", emoji: "📦", template: "You lifted {weight} lbs! You're moving heavy boxes of old parchment maps and brass compasses." },
      { item: "a vintage arcade cabinet", emoji: "🕹️", template: "You pressed {weight} lbs. Pac-Man himself would salute your vintage joystick-smashing strength." },
      { item: "a heavy-duty gas lawnmower", emoji: "🚜", template: "You lifted {weight} lbs! That's a solid steel lawnmower ready to chop grass and build serious mass." },
      { item: "a pro linebacker's full gear bag", emoji: "🎒", template: "You pushed {weight} lbs! Packed with helmets, pads, cleats, and raw gridiron attitude." },
      { item: "a giant pile of soaking wet laundry", emoji: "🧺", template: "You hoisted {weight} lbs! You have defeated the ultimate final boss of domestic household chores." },
      { item: "thirty very well-fed house cats", emoji: "🐈", template: "You moved {weight} lbs! That is equivalent to lifting a purring mountain of 30 domestic cats." },
      { item: "a studio subwoofer system", emoji: "🔊", template: "You lifted {weight} lbs. Dropping heavy bass beats and deep reps that shake the gym floor!" },
      { item: "a solid red oak coffee table", emoji: "🪵", template: "You pressed {weight} lbs! The exact table that will disintegrate your pinky toe if you stub it in the dark." },
      { item: "a commercial washing machine", emoji: "🧼", template: "You accumulated {weight} lbs! Lifts are clean, spins are fast, you are on a perfect wash cycle." }
    ]
  },
  // 4. weight < 650 (limit: 650)
  {
    limit: 650,
    comparisons: [
      { item: "an adult grizzly bear", emoji: "🐻", template: "A colossal effort! You hoisted a cumulative total of {weight} lbs. That is equivalent to lifting a fully grown grizzly bear in the deep wilderness." },
      { item: "a retro vintage jukebox", emoji: "📻", template: "You pumped {weight} lbs! That is equivalent to moving a classic neon-glowing diner jukebox playing the 50s hits." },
      { item: "a medieval wooden catapult", emoji: "🏹", template: "You lifted {weight} lbs! Ready to launch giant stone boulders at your personal goals and records." },
      { item: "an incredibly plump domestic pig", emoji: "🐖", template: "You hoisted {weight} lbs! That is one happy, heavy farm pig living the absolute absolute high life." },
      { item: "a vintage oak upright piano", emoji: "🎹", template: "You pushed {weight} lbs! Perfect for composing a heavy-metal symphony with your bare hands." },
      { item: "a commercial snack vending machine", emoji: "🪙", template: "You accumulated {weight} lbs! Loaded with protein shakes, energy bars, and high-frequency vibrations." },
      { item: "a classic British red telephone booth", emoji: "☎️", template: "You lifted {weight} lbs! Directly imported from a London street corner, complete with cast-iron crown details." },
      { item: "a high-density computer server rack", emoji: "🖥️", template: "You hoisted {weight} lbs! Running the deep neural-net algorithms of absolute training power." },
      { item: "a roar-happy chopper motorcycle", emoji: "🏍️", template: "You pressed {weight} lbs! That's a heavy-duty highway motorcycle ready to hit the scenic route." },
      { item: "a massive block of Swiss chocolate", emoji: "🍫", template: "You lifted {weight} lbs! The ultimate dream of every sweet-toothed weightlifter on earth." },
      { item: "a bronze statue of a musculous gym god", emoji: "🗿", template: "You accumulated {weight} lbs! Mirroring your own glorious physique in heavy, solid bronze form." },
      { item: "a commercial health-club treadmill", emoji: "🏃", template: "You pushed {weight} lbs! You're literally moving the treadmill instead of running on it. Alpha move." },
      { item: "a heavy bank safe stuffed with silver", emoji: "🔓", template: "You hoisted {weight} lbs! Highly secured assets and maximum physical steel wealth unlocked." },
      { item: "a standard steel oil drum", emoji: "🛢️", template: "You lifted {weight} lbs! Filled to the brim with raw industrial power and combustible workout fuel." },
      { item: "a giant king-size mattress", emoji: "🛏️", template: "You pressed {weight} lbs! But about ten times harder to carry up a narrow set of apartment stairs." },
      { item: "a historical cast-bronze cannon", emoji: "💣", template: "You hoisted {weight} lbs! Ready to fire high-velocity reps directly into the sky." },
      { item: "a commercial slate pool table", emoji: "🎱", template: "You lifted {weight} lbs! Chalk up your hands, rack up the heavy weights, and make the shot." },
      { item: "a fully-grown male jungle lion", emoji: "🦁", template: "You pressed {weight} lbs! The king of the jungle is checking out your majestic lifting form with pure respect." },
      { item: "a double-wide commercial chest freezer", emoji: "❄️", template: "You accumulated {weight} lbs! Storing enough meal-prepped chicken breasts to survive an ice age." },
      { item: "one hundred heavy bowling balls", emoji: "🎳", template: "You hoisted {weight} lbs! A massive strike of cumulative iron. Bowling lanes aren't ready for this." }
    ]
  },
  // 5. weight < 1200 (limit: 1200)
  {
    limit: 1200,
    comparisons: [
      { item: "a classic concert grand piano", emoji: "🎹", template: "Incredible power! You lifted a total volume of {weight} lbs. That matches the weight of a full Steinway Grand Concert Piano!" },
      { item: "a very grumpy wild bull moose", emoji: "🫎", template: "You lifted {weight} lbs! He has massive 6-foot antlers and absolutely zero patience for gym chatter." },
      { item: "a deluxe fiberglass hot tub", emoji: "🛁", template: "You pushed {weight} lbs! Ready to be filled with hot bubbling water for a well-earned post-workout soak." },
      { item: "a collection of medieval broadswords", emoji: "⚔️", template: "You accumulated {weight} lbs! Enough heavy steel weaponry to arm an entire garrison of castle knights." },
      { item: "a commercial-grade steel security safe", emoji: "🔐", template: "You hoisted {weight} lbs! Built to withstand bank heists, lasers, and extreme muscle power." },
      { item: "a solid marble Athenian column", emoji: "🏛️", template: "You pressed {weight} lbs! Straight out of the ruins of the Parthenon. Truly historic strength." },
      { item: "a souped-up electric golf cart", emoji: "🛺", template: "You lifted {weight} lbs! Cruising through the hills with maximum high-torque performance." },
      { item: "a giant block of sharp Wisconsin cheddar", emoji: "🧀", template: "You accumulated {weight} lbs! Enough delicious cheese to feed a small country for a whole year." },
      { item: "a high-voltage industrial generator", emoji: "⚡", template: "You hoisted {weight} lbs! Generates enough electrical juice to power the entire neighborhood's grid." },
      { item: "a massive male Florida alligator", emoji: "🐊", template: "You lifted {weight} lbs! Snapping jaws, armored hide, and pure swamp-dwelling muscle power." },
      { item: "a group of vintage phone booths", emoji: "📞", template: "You pressed {weight} lbs! For when you need to make multiple retro calls to report your massive gains." },
      { item: "a heavy-duty snowmobile", emoji: "❄️", template: "You lifted {weight} lbs! Ready to tear through the deep arctic snowdrifts at breakneck speeds." },
      { item: "a solid iron Viking ship anchor", emoji: "⚓", template: "You hoisted {weight} lbs! Capable of keeping a grand longship anchored in the middle of a North Sea storm." },
      { item: "a commercial brick pizza oven", emoji: "🍕", template: "You pushed {weight} lbs! Baking delicious sourdough pies at a blazing 900 degrees." },
      { item: "a solid-gold cartoon piggy bank", emoji: "🐷", template: "You accumulated {weight} lbs! Stuffed with loose quarters, gold coins, and absolute financial freedom." },
      { item: "an array of satellite dishes", emoji: "📡", template: "You lifted {weight} lbs! Broadcasting the signals of your legendary workout directly to deep space." },
      { item: "an adult desert Arabian camel", emoji: "🐫", template: "You pressed {weight} lbs! Built for extreme endurance, desert heat, and carrying heavy loads." },
      { item: "fifty heavy-duty car batteries", emoji: "🔋", template: "You hoisted {weight} lbs! Sparking extreme chemical energy directly through your lifting veins." },
      { item: "an industrial building air conditioner", emoji: "❄️", template: "You lifted {weight} lbs! Keeping the entire commercial training facility cool under high pressure." },
      { item: "a heavy deep-sea brass diving bell", emoji: "🤿", template: "You accumulated {weight} lbs! Ready to explore the dark, high-pressure trenches of physical potential." }
    ]
  },
  // 6. weight < 2200 (limit: 2200)
  {
    limit: 2200,
    comparisons: [
      { item: "a vintage Volkswagen Beetle car", emoji: "🚗", template: "Absolute beast mode! Your cumulative volume of {weight} lbs is equivalent to lifting an entire 1960s classic VW Beetle off its wheels." },
      { item: "an industrial high-speed elevator motor", emoji: "🛗", template: "You hoisted {weight} lbs! Engineered to pull metal cables and move high-rise buildings." },
      { item: "a small family of milk dairy cows", emoji: "🐄", template: "You lifted {weight} lbs! Grazing peacefully in the pasture while you stack massive weights." },
      { item: "a commercial airplane landing gear", emoji: "✈️", template: "You pressed {weight} lbs! Heavy steel shocks built for a smooth touchdown on the runway." },
      { item: "a historic cast-iron church bell", emoji: "🔔", template: "You accumulated {weight} lbs! Ringing out the sweet sound of absolute muscle victory to the valley." },
      { item: "a fiberglass ocean sailboat hull", emoji: "⛵", template: "You hoisted {weight} lbs! Ready to catch the ocean gale and sail straight into the sunset." },
      { item: "a massive forklift steel counterweight", emoji: "🏗️", template: "You lifted {weight} lbs! The solid block of metal that keeps heavy machines from tipping over." },
      { item: "three commercial stone pizza ovens", emoji: "🍕", template: "You pressed {weight} lbs! Enough baking power to feed an entire sports stadium in minutes." },
      { item: "a solid steel bank vault entry door", emoji: "🚪", template: "You accumulated {weight} lbs! Protecting the vaults and keeping your strength records locked tight." },
      { item: "a group of five neon jukeboxes", emoji: "📻", template: "You hoisted {weight} lbs! Rocking a multi-track stereo symphony of absolute heavy metal lifting." },
      { item: "a solid red oak banquet table", emoji: "🪵", template: "You lifted {weight} lbs! Built of ancient wood, fit to hold a glorious feast for a hundred warriors." },
      { item: "an industrial rubber conveyor belt system", emoji: "⚙️", template: "You pressed {weight} lbs! Moving tons of raw aggregate across the quarry floor." },
      { item: "a heavy-duty diesel engine block", emoji: "🚂", template: "You accumulated {weight} lbs! High horsepower, immense low-end torque, and pure mechanical power." },
      { item: "a commercial high-density server stack", emoji: "💻", template: "You lifted {weight} lbs! Running advanced machine learning models to analyze your epic lifting performance." },
      { item: "a pair of heavy vintage cast-iron stoves", emoji: "🔥", template: "You hoisted {weight} lbs! Built to keep a log cabin cozy during a massive winter blizzard." },
      { item: "a professional monster truck tire", emoji: "🛞", template: "You pressed {weight} lbs! Designed to crush rusted cars and roll over any training obstacles." },
      { item: "an ancient Chinese ceremonial bronze bell", emoji: "🔔", template: "You lifted {weight} lbs! Resonating the vibrations of pure strength through the centuries." },
      { item: "a massive backup computer battery rack", emoji: "🔋", template: "You accumulated {weight} lbs! Keeping the entire world's cloud storage online during a storm." },
      { item: "a fully-grown male African giraffe", emoji: "🦒", template: "You hoisted {weight} lbs! Reaching the highest acacia tree leaves with extreme leverage." },
      { item: "a full bundle of industrial wall drywall", emoji: "🧱", template: "You pressed {weight} lbs! Enough heavy plaster to build a completely new gym annex." }
    ]
  },
  // 7. weight < 4500 (limit: 4500)
  {
    limit: 4500,
    comparisons: [
      { item: "a massive white rhinoceros", emoji: "🦏", template: "Godlike strength! You moved a staggering {weight} lbs of cumulative weight. That is equivalent to lifting a giant African white rhinoceros clean off the ground." },
      { item: "a mid-sized four-wheel-drive SUV", emoji: "🚙", template: "You hoisted {weight} lbs! Ready to climb rocky mountain trails and cross rushing desert rivers." },
      { item: "a commercial-grade helicopter rotor hub", emoji: "🚁", template: "You lifted {weight} lbs! Spinning at extreme RPMs to generate thousands of pounds of lift." },
      { item: "a high-pressure industrial steam boiler", emoji: "💨", template: "You pressed {weight} lbs! Converting raw water into high-pressure energy and massive workout gains." },
      { item: "a historic castle iron drawbridge gate", emoji: "🏰", template: "You accumulated {weight} lbs! Engineered to protect the fortress and hold back attacking hordes." },
      { item: "a solid block of the Great Wall of China", emoji: "🧱", template: "You hoisted {weight} lbs! Ancient stone blocks laid down to stand tall for thousands of years." },
      { item: "a complete warehouse set of gym gear", emoji: "🏋️", template: "You lifted {weight} lbs! You've basically moved the entire weight room floor in a single workout." },
      { item: "a deep-ocean cruise ship anchor chain", emoji: "⚓", template: "You pressed {weight} lbs! Heavy-duty forged links built to hold massive ocean liners in place." },
      { item: "a massive ancient redwood sequoia log", emoji: "🪵", template: "You accumulated {weight} lbs! Containing over a thousand years of dense, rings-of-history growth." },
      { item: "a vintage steam-powered farm tractor", emoji: "🚜", template: "You hoisted {weight} lbs! Chugging along the heritage wheat fields with massive iron wheels." },
      { item: "a bronze monument of a roaring bull", emoji: "🐂", template: "You lifted {weight} lbs! Charging forward into the markets of absolute muscle accumulation." },
      { item: "an industrial high-precision metal lathe", emoji: "⚙️", template: "You pressed {weight} lbs! Forging and carving cold hard steel with extreme mechanical force." },
      { item: "a backup power generator container", emoji: "⚡", template: "You accumulated {weight} lbs! Ready to keep an entire city hospital running during a blackout." },
      { item: "a commercial cargo shipping container door", emoji: "🚢", template: "You hoisted {weight} lbs! Built of reinforced steel to protect valuable goods across the sea." },
      { item: "a heavy-duty solid steel bank vault", emoji: "🏦", template: "You lifted {weight} lbs! Keeping your personal records and assets locked behind massive plates." },
      { item: "a historic steam locomotive wheel set", emoji: "🚂", template: "You pressed {weight} lbs! Heavy steel flanged wheels rolling down the tracks of ultimate progress." },
      { item: "an industrial heavy hydraulic press", emoji: "🦾", template: "You accumulated {weight} lbs! Crushing any barriers, obstacles, and personal bests in your way." },
      { item: "a commercial high-rise building chiller", emoji: "❄️", template: "You hoisted {weight} lbs! Keeping a 50-story corporate skyscraper cool during a heatwave." },
      { item: "a fleet of twenty retro Vespa scooters", emoji: "🛵", template: "You lifted {weight} lbs! Lined up neatly for a grand rally through the Italian countryside." },
      { item: "a solid stone ancient pharaoh sarcophagus", emoji: "🪦", template: "You pressed {weight} lbs! Carved out of solid mountain granite to secure kings for millennia." }
    ]
  },
  // 8. weight < 5500 (limit: 5500)
  {
    limit: 5500,
    comparisons: [
      { item: "a fully-loaded camper trailer", emoji: "🚐", template: "Stunning power! You moved {weight} lbs! That is equivalent to towing a luxury camper trailer ready for a cross-country adventure." },
      { item: "a double-decker bus engine block", emoji: "🚌", template: "You hoisted {weight} lbs! High-displacement, heavy-duty iron designed to move millions of passengers." },
      { item: "a collection of heavy-duty security safes", emoji: "🔐", template: "You lifted {weight} lbs! Built of solid steel and fireproof alloys to hold precious crown jewels." },
      { item: "a life-size bronze statue of an elephant", emoji: "🐘", template: "You pressed {weight} lbs! A majestic monument of pure weight and artistic masterwork." },
      { item: "a commercial water purification tank", emoji: "💧", template: "You accumulated {weight} lbs! Filtering millions of gallons of water for a busy metropolis." },
      { item: "a diesel locomotive generator assembly", emoji: "🚂", template: "You hoisted {weight} lbs! The primary power source humming inside a massive freight train." },
      { item: "a bundle of heavy iron railroad tracks", emoji: "🛤️", template: "You lifted {weight} lbs! Steel tracks laid down to connect entire nations across continents." },
      { item: "the historic iron gate of a cathedral", emoji: "🏰", template: "You pressed {weight} lbs! Intricately hand-forged, massive steel gates standing tall for centuries." },
      { item: "a stack of premium solid marble slabs", emoji: "🏛️", template: "You accumulated {weight} lbs! Ready to construct columns for a brand-new palace of strength." },
      { item: "a commercial passenger jet turbine fan", emoji: "✈️", template: "You hoisted {weight} lbs! Sucking in massive air volumes and blasting out high-velocity thrust." },
      { item: "an industrial rock crusher machine", emoji: "🪨", template: "You lifted {weight} lbs! Effortlessly pulverizing giant boulders into fine construction gravel." },
      { item: "a city grid backup battery array", emoji: "🔋", template: "You pressed {weight} lbs! Storing megawatts of green electrical energy for peak grid security." },
      { item: "a vintage red fire engine truck pump", emoji: "🚒", template: "You accumulated {weight} lbs! Heavy-duty water cannon machinery designed to fight blazing fires." },
      { item: "a concrete bridge foundation block", emoji: "🧱", template: "You hoisted {weight} lbs! Solid concrete anchoring a steel suspension bridge over a rushing river." },
      { item: "a giant industrial steel cable spool", emoji: "🧵", template: "You lifted {weight} lbs! Spooling miles of thick braided wire to construct a suspension bridge." },
      { item: "a military armored personnel carrier", emoji: "🎖️", template: "You pressed {weight} lbs! Heavy-plated tactical vehicle built to withstand the toughest elements." },
      { item: "a stack of seasoned hardwood logs", emoji: "🪵", template: "You accumulated {weight} lbs! Ready to construct a beautiful, heavy-timber mountain lodge." },
      { item: "a colossal bronze statue of Loki", emoji: "🗿", template: "You hoisted {weight} lbs! The trickster god himself is smiling down at your heroic lifting volume." },
      { item: "three vintage Volkswagen Beetle cars", emoji: "🚗", template: "You lifted {weight} lbs! That is like moving three classic Beetles parked in a tight row." },
      { item: "a direct-drive coastal wind turbine hub", emoji: "💨", template: "You pressed {weight} lbs! Capturing the heavy sea gales to generate clean energy." }
    ]
  },
  // 9. weight < 6500 (limit: 6500)
  {
    limit: 6500,
    comparisons: [
      { item: "a massive territorial Hippo", emoji: "🦛", template: "Terrifying power! You moved {weight} lbs! That is equivalent to lifting a fully grown, hyper-aggressive wild river hippopotamus." },
      { item: "a commercial delivery cargo van", emoji: "🚚", template: "You hoisted {weight} lbs! Stuffed to the brim with packages and ready for the early morning route." },
      { item: "an antique cathedral pipe organ", emoji: "🎹", template: "You lifted {weight} lbs! Dozens of heavy brass pipes, wind chests, and solid wood frames." },
      { item: "a solid granite kitchen island slab", emoji: "🪨", template: "You pressed {weight} lbs! Carved from a quarry to make the ultimate heavy-duty cooking station." },
      { item: "a historic lighthouse glass lens", emoji: "🔦", template: "You accumulated {weight} lbs! A massive Fresnel glass lens designed to guide ships through rocky bays." },
      { item: "an empty steel shipping container", emoji: "🚢", template: "You hoisted {weight} lbs! A full-size intermodal container ready to sail across the oceans." },
      { item: "an industrial paper milling machine", emoji: "📄", template: "You lifted {weight} lbs! Spinning steel drums that press out miles of high-quality paper rolls." },
      { item: "a harbor battleship mooring buoy", emoji: "⚓", template: "You pressed {weight} lbs! Anchoring multi-ton military cruisers and vessels safely in deep water." },
      { item: "an array of solar panel metal frames", emoji: "☀️", template: "You accumulated {weight} lbs! Heavy galvanized steel supporting a desert clean energy farm." },
      { item: "a historic bronze city monument", emoji: "🗽", template: "You hoisted {weight} lbs! Built to honor the founders and stand tall in the central public park." },
      { item: "an industrial ore smelting furnace", emoji: "🔥", template: "You lifted {weight} lbs! Built of thick firebrick and steel to melt metals at extreme temperatures." },
      { item: "a commercial glass-blowing oven assembly", emoji: "🏺", template: "You pressed {weight} lbs! Keeping molten glass hot and ready for master glassblowers." },
      { item: "a massive pile of cast-iron plates", emoji: "🏋️", template: "You accumulated {weight} lbs! A meta-accomplishment—literally lifting a massive warehouse of plates." },
      { item: "a vintage airport crash fire truck", emoji: "🚒", template: "You hoisted {weight} lbs! Heavy foam cannons and diesel power for rapid airport emergencies." },
      { item: "a stack of solid oak wine barrels", emoji: "🍷", template: "You lifted {weight} lbs! Aging premium vintage inside a cold, dusty underground cellar." },
      { item: "a hospital emergency backup generator", emoji: "⚡", template: "You pressed {weight} lbs! Keeping critical life-support systems fully powered during a storm." },
      { item: "a deep-well oil exploration drilling rig", emoji: "🛢️", template: "You accumulated {weight} lbs! Forging through miles of solid crust to strike raw energy." },
      { item: "a mechanical clock tower gearset", emoji: "⏰", template: "You hoisted {weight} lbs! Massive brass wheels turning to keep perfect time for the whole city." },
      { item: "a giant bull elephant seal", emoji: "🦭", template: "You lifted {weight} lbs! Basking on the rocky shores and defending its territory with pure bulk." },
      { item: "a commercial security vault vault door", emoji: "🏦", template: "You pressed {weight} lbs! Massive steel locking bars protecting the national currency reserves." }
    ]
  },
  // 10. weight < 7500 (limit: 7500)
  {
    limit: 7500,
    comparisons: [
      { item: "a majestic Asian Elephant", emoji: "🐘", template: "Monstrous energy! You moved {weight} lbs! That matches the weight of a majestic fully-grown Asian Elephant." },
      { item: "a stretched luxury limousine", emoji: "🚘", template: "You hoisted {weight} lbs! Sleek, long, packed with leather seats, and running on a powerful engine." },
      { item: "an ancient Egyptian granite obelisk", emoji: "🏛️", template: "You lifted {weight} lbs! Carved out of solid rock, etched with deep hieroglyphs of historic triumphs." },
      { item: "a military satellite uplink truck", emoji: "📡", template: "You pressed {weight} lbs! Packed with advanced communication systems and heavy-duty steel dishes." },
      { item: "a commercial copper distilling column", emoji: "🧪", template: "You accumulated {weight} lbs! Crafting premium single-malt whiskey inside a historic distillery." },
      { item: "a subsea power cable drum spool", emoji: "🛞", template: "You hoisted {weight} lbs! Spooling miles of high-voltage insulated wires for ocean floor grids." },
      { item: "a vintage steam road roller", emoji: "🚜", template: "You lifted {weight} lbs! Flattening asphalt with extreme, unyielding mechanical weight." },
      { item: "a stack of architectural copper sheets", emoji: "🪙", template: "You pressed {weight} lbs! Ready to build a shimmering roof for a historic city library." },
      { item: "a deep-ocean research bathyscaphe", emoji: "🚢", template: "You accumulated {weight} lbs! Engineered to explore the absolute depths of the Mariana Trench." },
      { item: "an industrial mechanical shovel arm", emoji: "🏗️", template: "You hoisted {weight} lbs! Scooping tons of raw iron ore out of a deep open-pit mine." },
      { item: "a giant cathedral bronze bell", emoji: "🔔", template: "You lifted {weight} lbs! Whose deep, resonant ring can be heard across ten miles of countryside." },
      { item: "a commercial industrial bakery mixer", emoji: "🍞", template: "You pressed {weight} lbs! Kneading hundreds of pounds of sourdough dough at a time." },
      { item: "a compressed Antarctic blue ice block", emoji: "❄️", template: "You accumulated {weight} lbs! Ice compressed over tens of thousands of years in frozen valleys." },
      { item: "a heavy-duty vintage military cargo truck", emoji: "🚚", template: "You hoisted {weight} lbs! Built to plow through deep mud, snow, and rough tactical terrain." },
      { item: "a concrete harbor wave break block", emoji: "🧱", template: "You lifted {weight} lbs! Absorbing the kinetic energy of giant, crashing ocean storm waves." },
      { item: "an industrial steel flywheel disc", emoji: "⚙️", template: "You pressed {weight} lbs! Storing massive rotational energy to power heavy-duty factory presses." },
      { item: "a city water pump station turbine", emoji: "💧", template: "You accumulated {weight} lbs! Moving millions of gallons of drinking water through city pipes." },
      { item: "a bronze statue of a roaring grizzly", emoji: "🐻", template: "You hoisted {weight} lbs! Standing guard at the majestic entrance of a national park." },
      { item: "six classic concert grand pianos", emoji: "🎹", template: "You lifted {weight} lbs! Lined up for an epic, high-volume classical music symphony." },
      { item: "a container of grid-scale solar batteries", emoji: "🔋", template: "You pressed {weight} lbs! Keeping the green energy lights burning throughout the night." }
    ]
  },
  // 11. weight < 8500 (limit: 8500)
  {
    limit: 8500,
    comparisons: [
      { item: "a Giant African Bush Elephant", emoji: "🐘", template: "Incredible feat! You lifted {weight} lbs! That is equivalent to moving a giant African Bush Elephant—the largest living land mammal!" },
      { item: "a historic steam locomotive cabin", emoji: "🚂", template: "You hoisted {weight} lbs! Hot coal fireboxes, iron controls, and raw vintage train power." },
      { item: "an airport fuel tanker truck", emoji: "⛽", template: "You lifted {weight} lbs! Filled with high-octane fuel to power giant passenger airplanes." },
      { item: "a medieval castle drawbridge gate", emoji: "🏰", template: "You pressed {weight} lbs! Heavy timber and iron chains designed to withstand massive battering rams." },
      { item: "a giant rolled steel sheet coil", emoji: "⚙️", template: "You accumulated {weight} lbs! Ready to be stamped into panels for hundreds of new vehicles." },
      { item: "a subsea blowout preventer stack", emoji: "🛢️", template: "You hoisted {weight} lbs! Massive high-pressure valves built for extreme ocean floor safety." },
      { item: "a bronze statue of a temple dragon", emoji: "🐉", template: "You lifted {weight} lbs! An intricate, majestic monument guarding a sacred temple courtyard." },
      { item: "a commercial grid backup battery container", emoji: "🔋", template: "You pressed {weight} lbs! Providing emergency power to an entire downtown high-rise block." },
      { item: "a high-temperature industrial brick kiln", emoji: "🔥", template: "You accumulated {weight} lbs! Baking thousands of high-strength clay building bricks at once." },
      { item: "a hydraulic accumulator assembly", emoji: "🦾", template: "You hoisted {weight} lbs! Storing high-pressure hydraulic fluid for heavy industrial machinery." },
      { item: "an industrial rock grinding mill drum", emoji: "🪨", template: "You lifted {weight} lbs! Grinding solid mountain granite into fine building aggregates." },
      { item: "an airport airplane pushback tractor", emoji: "🚜", template: "You pressed {weight} lbs! High-torque diesel tractor built to tow 100-ton passenger jets." },
      { item: "a steel harbor mooring anchor crane", emoji: "⚓", template: "You accumulated {weight} lbs! Securing floating platforms against intense ocean currents." },
      { item: "a solid marble courtyard fountain", emoji: "⛲", template: "You hoisted {weight} lbs! A beautiful multi-tiered basin with water cascading down." },
      { item: "a food processing warehouse drying rack", emoji: "🥦", template: "You lifted {weight} lbs! Dehydrating organic crops and ingredients at a major scale." },
      { item: "a mainframe supercomputer cluster rack", emoji: "💻", template: "You pressed {weight} lbs! Running the core computing algorithms of a major technology giant." },
      { item: "a military main battle tank turret", emoji: "🎖️", template: "You accumulated {weight} lbs! Packed with reinforced steel armor and heavy-duty guidance gears." },
      { item: "one thousand solid brass trumpets", emoji: "🎺", template: "You hoisted {weight} lbs! Ready for a massive, ear-splitting ceremonial marching band." },
      { item: "a precast concrete highway bridge girder", emoji: "🌉", template: "You lifted {weight} lbs! Spanning valleys to build the roads of tomorrow with absolute strength." },
      { item: "a shipyard intermodal container crane", emoji: "🏗️", template: "You pressed {weight} lbs! Hoisting massive cargo containers off deep-sea vessels." }
    ]
  },
  // 12. weight < 9500 (limit: 9500)
  {
    limit: 9500,
    comparisons: [
      { item: "a fully-loaded freight shipping container", emoji: "🚢", template: "Epic session volume! You moved {weight} lbs! That matches an intermodal shipping container packed to the ceiling with gym gear." },
      { item: "a steam-powered farm tractor", emoji: "🚜", template: "You hoisted {weight} lbs! Chugging through heritage fields with high-pressure boilers." },
      { item: "a concrete highway sound barrier block", emoji: "🧱", template: "You lifted {weight} lbs! Built of solid reinforced concrete to block noise along high-speed freeways." },
      { item: "a giant industrial paper roll spool", emoji: "📄", template: "You pressed {weight} lbs! Weighing as much as a small herd of mature forest animals." },
      { item: "an executive passenger transport helicopter", emoji: "🚁", template: "You accumulated {weight} lbs! Complete with fuel tanks, flight electronics, and leather seats." },
      { item: "a national mint security safe box", emoji: "🔐", template: "You hoisted {weight} lbs! Built to survive extreme heat, explosions, and safe-cracking tools." },
      { item: "a giant redwood tree trunk section", emoji: "🪵", template: "You lifted {weight} lbs! Containing thousands of rings charting the climate of ancient history." },
      { item: "a commercial server backup generator", emoji: "⚡", template: "You pressed {weight} lbs! Instantly supplying backup power to run a giant cleanroom facility." },
      { item: "an industrial bakery conveyor oven", emoji: "🍞", template: "You accumulated {weight} lbs! Baking thousands of loaves of delicious organic sourdough a day." },
      { item: "a bronze monument of a charging rhino", emoji: "🦏", template: "You hoisted {weight} lbs! Etched in pure bronze to capture the energy of absolute momentum." },
      { item: "a commercial building water chiller", emoji: "❄️", template: "You lifted {weight} lbs! Keeping heavy corporate mainframe servers from overheating." },
      { item: "a harbor shipwreck salvage crane block", emoji: "🏗️", template: "You pressed {weight} lbs! Built to lift historic sunken ships off the deep muddy ocean floor." },
      { item: "a stack of seasoned solid teak logs", emoji: "🪵", template: "You accumulated {weight} lbs! High-density timber logs destined for a master craftsman's workshop." },
      { item: "a direct-drive wind turbine generator", emoji: "💨", template: "You hoisted {weight} lbs! Converting high-speed wind energy into megawatts of clean power." },
      { item: "a seawater desalination membrane tank", emoji: "💧", template: "You lifted {weight} lbs! Filtering out sea salt to supply clean drinking water." },
      { item: "a vintage fire engine ladder pump", emoji: "🚒", template: "You pressed {weight} lbs! Packed with ladders, water pumps, and heavy-duty diesel engines." },
      { item: "an industrial steel smelting crucible", emoji: "🔥", template: "You accumulated {weight} lbs! Built to contain glowing, white-hot liquid steel before casting." },
      { item: "a solid granite historic monolith", emoji: "🗿", template: "You hoisted {weight} lbs! Carved out to honor the legendary lifting champions of history." },
      { item: "three fully-loaded luxury family SUVs", emoji: "🚙", template: "You lifted {weight} lbs! That is equivalent to lifting three modern SUVs parked bumper-to-bumper." },
      { item: "a high-voltage power grid transformer", emoji: "⚡", template: "You pressed {weight} lbs! Delivering millions of watts of electricity to a busy city grid." }
    ]
  },
  // 13. weight < 11000 (limit: 11000)
  {
    limit: 11000,
    comparisons: [
      { item: "a fully-loaded yellow School Bus", emoji: "🚌", template: "Unstoppable force! You moved {weight} lbs! That is like lifting a yellow school bus full of school kids above your head." },
      { item: "a family of three adult Hippos", emoji: "🦛", template: "You hoisted {weight} lbs! Relaxing in a cool, muddy swamp on a hot summer afternoon." },
      { item: "a medieval siege rolling tower", emoji: "🏰", template: "You lifted {weight} lbs! Heavy timber frames and iron wheels rolling towards fortress walls." },
      { item: "an industrial excavator steel bucket", emoji: "🚜", template: "You pressed {weight} lbs! Designed to scoop up tons of rocky earth in a single motion." },
      { item: "a commercial airliner landing gear hub", emoji: "✈️", template: "You accumulated {weight} lbs! Massive hydraulic shock absorbers engineered for jumbo jet touchdowns." },
      { item: "the steel propeller of an ocean liner", emoji: "🚢", template: "You hoisted {weight} lbs! Designed to push giant container ships through rough ocean storms." },
      { item: "a backup generator diesel engine block", emoji: "🚂", template: "You lifted {weight} lbs! A mechanical masterpiece of high displacement and massive torque." },
      { item: "a historic church bell from Europe", emoji: "🔔", template: "You pressed {weight} lbs! Etched with historic patterns and ringing out across rolling valleys." },
      { item: "a bundle of structural steel I-beams", emoji: "🏗️", template: "You accumulated {weight} lbs! High-strength beams ready to support a brand new skyscraper." },
      { item: "a high-pressure industrial boiler system", emoji: "💨", template: "You hoisted {weight} lbs! Powering a whole historic city manufacturing district." },
      { item: "a harbor breakwater concrete block", emoji: "🧱", template: "You lifted {weight} lbs! Solid concrete built to deflect hurricane-force waves." },
      { item: "a stone pizza oven warehouse dome", emoji: "🍕", template: "You pressed {weight} lbs! Capable of baking fifty artisanal pies simultaneously." },
      { item: "a deep-sea research exploration sub", emoji: "🤿", template: "You accumulated {weight} lbs! Designed to explore the pitch-black floors of the ocean." },
      { item: "a solid oak Viking banquet table set", emoji: "🪵", template: "You hoisted {weight} lbs! Built of ancient wood to seat a hundred celebrating warriors." },
      { item: "a grid-scale neighborhood battery unit", emoji: "🔋", template: "You lifted {weight} lbs! Storing clean solar energy for a whole block of homes." },
      { item: "a vintage steam train wheel set", emoji: "🚂", template: "You pressed {weight} lbs! Solid cast-iron wheels designed for cross-country tracks." },
      { item: "a bronze monument of a roaring dragon", emoji: "🐉", template: "You accumulated {weight} lbs! Etched with shining copper scales and massive wings." },
      { item: "a water purification facility turbine", emoji: "💧", template: "You hoisted {weight} lbs! Moving fresh clean drinking water to thousands of homes." },
      { item: "an armored personnel carrier chassis", emoji: "🎖️", template: "You lifted {weight} lbs! Built of thick composite steel plating to withstand impacts." },
      { item: "a giant coastal wind turbine rotor hub", emoji: "💨", template: "You pressed {weight} lbs! Built of high-strength carbon fibers to capture ocean gales." }
    ]
  },
  // 14. weight < 12000 (limit: 12000)
  {
    limit: 12000,
    comparisons: [
      { item: "a full-grown Tyrannosaurus Rex", emoji: "🦖", template: "Legendary strength unlocked! You moved {weight} lbs! That matches the weight of a full-grown Tyrannosaurus Rex!" },
      { item: "a herd of five wild bison", emoji: "🦬", template: "You hoisted {weight} lbs! Charging across the grassy plains, kicking up a storm of dust." },
      { item: "a corporate server backup power bank", emoji: "⚡", template: "You lifted {weight} lbs! Supplying power to a 30-story skyscraper's mainframe computer systems." },
      { item: "a polished marble entrance archway", emoji: "🏛️", template: "You pressed {weight} lbs! Welcoming sports fans to a historic, grand Olympic coliseum." },
      { item: "an industrial steel plate rolling machine", emoji: "⚙️", template: "You accumulated {weight} lbs! Heavy rollers designed to flatten solid sheets of high-carbon steel." },
      { item: "a commercial deep-sea diving habitat", emoji: "🚢", template: "You hoisted {weight} lbs! Built to allow researchers to live and work at the bottom of the bay." },
      { item: "a massive stack of oak railroad ties", emoji: "🛤️", template: "You lifted {weight} lbs! Packed with dense hardwood timbers and solid iron plates." },
      { item: "a hydroelectric dam mechanical gearset", emoji: "⚙️", template: "You pressed {weight} lbs! Spinning smoothly to convert river power into megawatts of electricity." },
      { item: "a warehouse industrial refrigeration plant", emoji: "❄️", template: "You accumulated {weight} lbs! Keeping tons of organic produce fresh and cold at a major port." },
      { item: "a bronze sculpture of a wild stallion", emoji: "🐴", template: "You hoisted {weight} lbs! Etched with majestic details, standing proud in a city square." },
      { item: "a concrete bridge support column block", emoji: "🧱", template: "You lifted {weight} lbs! Supporting thousands of vehicles daily on a modern suspension bridge." },
      { item: "an airport jetliner pushback tractor", emoji: "🚜", template: "You pressed {weight} lbs! Designed to push 200-ton passenger jets away from the gate." },
      { item: "a cruise ship anchor steel chain", emoji: "⚓", template: "You accumulated {weight} lbs! Massive links of forged steel securing a giant floating hotel." },
      { item: "a giant sequoia redwood log segment", emoji: "🪵", template: "You hoisted {weight} lbs! A dense block of ancient wood showcasing centuries of forest history." },
      { item: "a municipal clean water storage tank", emoji: "💧", template: "You lifted {weight} lbs! Holding hundreds of thousands of gallons of pure drinking water." },
      { item: "a historic steam traction engine", emoji: "🚜", template: "You pressed {weight} lbs! Packed with iron steam boilers and heavy steel drivetrain gears." },
      { item: "an industrial quartzite crushing mill", emoji: "🪨", template: "You accumulated {weight} lbs! Pulverizing solid stone ore into industrial grade sand." },
      { item: "a set of cast-iron skillet collections", emoji: "🍳", template: "You hoisted {weight} lbs! Enough heavy-duty cast-iron pans to cook meals for an entire army brigade." },
      { item: "four luxury electric battery-pack SUVs", emoji: "🚙", template: "You lifted {weight} lbs! Packed with heavy copper motors and massive lithium battery cells." },
      { item: "a grid-scale high-voltage transformer block", emoji: "⚡", template: "You pressed {weight} lbs! Humming with the energy of absolute, high-torque electrical output." }
    ]
  },
  // 15. weight < 13000 (limit: 13000)
  {
    limit: 13000,
    comparisons: [
      { item: "a fully-loaded commercial Dump Truck", emoji: "🚛", template: "Incredible volume! You moved {weight} lbs! That matches a commercial dump truck loaded with gravel." },
      { item: "a bank vault stuffed with gold bars", emoji: "💰", template: "You hoisted {weight} lbs! Highly secured treasury vault containing millions in physical wealth." },
      { item: "a shipyard gantry crane hook block", emoji: "🏗️", template: "You lifted {weight} lbs! Solid steel block built to hoist giant dry-docked sea vessels." },
      { item: "a small herd of four adult moose", emoji: "🫎", template: "You pressed {weight} lbs! Standing tall in the clear northern lakes of the wilderness." },
      { item: "a water purification facility filter dome", emoji: "💧", template: "You accumulated {weight} lbs! Keeping millions of gallons of water pure for a busy city." },
      { item: "a historic cast-iron lighthouse tower", emoji: "🗼", template: "You hoisted {weight} lbs! Built of thick iron plates to withstand hurricane-force sea gales." },
      { item: "a warehouse stack of copper ingots", emoji: "🪙", template: "You lifted {weight} lbs! Shining brightly under the high lights of an industrial yard." },
      { item: "an offshore drilling rig anchor system", emoji: "⚓", template: "You pressed {weight} lbs! Gripping the sea floor with immense steel talons." },
      { item: "a giant ancient forest redwood log", emoji: "🪵", template: "You accumulated {weight} lbs! A majestic monument of ancient forest growth and history." },
      { item: "a bronze monument of a woolly mammoth", emoji: "🦣", template: "You hoisted {weight} lbs! Complete with giant curved tusks, standing tall in a museum hall." },
      { item: "an industrial sheet metal stamping press", emoji: "⚙️", template: "You lifted {weight} lbs! Flattening and shaping carbon steel panels with immense force." },
      { item: "a stack of commercial data-center batteries", emoji: "🔋", template: "You pressed {weight} lbs! Providing instant power backup to keep the internet running." },
      { item: "a cluster of ten stone pizza ovens", emoji: "🍕", template: "You accumulated {weight} lbs! Baking thousands of artisanal sourdough pies per hour." },
      { item: "a shipyard freight container hoist", emoji: "🏗️", template: "You hoisted {weight} lbs! Effortlessly lifting intermodal crates off incoming cargo ships." },
      { item: "a solid granite temple courtyard altar", emoji: "🏛️", template: "You lifted {weight} lbs! Carved out of a single massive block of mountain granite." },
      { item: "a historic steam train passenger boiler", emoji: "🚂", template: "You pressed {weight} lbs! Running at high pressure with thick cast-iron plates." },
      { item: "an industrial rock crushing mill hub", emoji: "🪨", template: "You accumulated {weight} lbs! Crushing quartzite stones for high-durability concrete structures." },
      { item: "an indoor sports arena HVAC chiller", emoji: "❄️", template: "You hoisted {weight} lbs! Keeping thousands of fans icy cool during the big game." },
      { item: "five classic vintage Volkswagen Beetles", emoji: "🚗", template: "You lifted {weight} lbs! That is equivalent to five vintage Beetles lined up in a row." },
      { item: "a direct-drive industrial wind turbine", emoji: "💨", template: "You pressed {weight} lbs! Generating clean green power for thousands of homes." }
    ]
  },
  // 16. weight < 14000 (limit: 14000)
  {
    limit: 14000,
    comparisons: [
      { item: "a prehistoric Woolly Mammoth", emoji: "🦣", template: "Titanic power! You moved {weight} lbs! That is equivalent to lifting a prehistoric Woolly Mammoth!" },
      { item: "a passenger jetliner turbine engine", emoji: "✈️", template: "You hoisted {weight} lbs! Generating tens of thousands of pounds of high-altitude thrust." },
      { item: "a highway transit concrete sound wall", emoji: "🧱", template: "You lifted {weight} lbs! Solid concrete panel built to soundproof busy highways." },
      { item: "a paper mill steel roller collection", emoji: "📄", template: "You pressed {weight} lbs! Heavy rolling drums pressing out continuous sheets of stock." },
      { item: "a heavy-lift military transport helicopter", emoji: "🚁", template: "You accumulated {weight} lbs! Built to carry heavy cargo to isolated mountain regions." },
      { item: "a national reserve bank vault door", emoji: "🔐", template: "You hoisted {weight} lbs! Solid steel plates packed with complex mechanical lock bars." },
      { item: "an ancient giant sequoia tree stump", emoji: "🪵", template: "You lifted {weight} lbs! Charting thousands of years of weather, history, and growth." },
      { item: "an industrial water cooling tower block", emoji: "❄️", template: "You pressed {weight} lbs! Preventing massive factory machinery from overheating." },
      { item: "a commercial industrial tunnel oven", emoji: "🍞", template: "You accumulated {weight} lbs! Baking endless batches of fresh organic sourdough loaves." },
      { item: "a bronze monument of a wild buffalo", emoji: "🦬", template: "You hoisted {weight} lbs! Capturing the untamed, muscular spirit of the western plains." },
      { item: "a major airport backup diesel generator", emoji: "⚡", template: "You lifted {weight} lbs! Keeping the runway navigation lights on during major grid outages." },
      { item: "a harbor shipwreck salvage crane block", emoji: "🏗️", template: "You pressed {weight} lbs! Heavy forged gears designed to pull ships off the ocean floor." },
      { item: "a stack of premium teakwood logs", emoji: "🪵", template: "You accumulated {weight} lbs! High-density timber logs waiting for a master builder's hands." },
      { item: "a direct-drive kinetic flywheel generator", emoji: "⚙️", template: "You hoisted {weight} lbs! Spinning at extreme speeds to store mechanical energy for grids." },
      { item: "a seawater desalination membrane filter", emoji: "💧", template: "You lifted {weight} lbs! Separating salt from ocean water to supply a whole island with fresh water." },
      { item: "a vintage fire rescue engine ladder set", emoji: "🚒", template: "You pressed {weight} lbs! Loaded with steel extension ladders and heavy-duty diesel pumps." },
      { item: "an industrial steel smelting ladle drum", emoji: "🔥", template: "You accumulated {weight} lbs! Designed to transfer glowing molten steel to casting molds." },
      { item: "a solid granite monument obelisk block", emoji: "🗿", template: "You hoisted {weight} lbs! Standing tall to honor the historic powerlifters of ancient eras." },
      { item: "three fully-loaded luxury electric sedans", emoji: "⚡", template: "You lifted {weight} lbs! Packed with heavy copper drivetrains and lithium battery cells." },
      { item: "a grid-scale electricity transformer hub", emoji: "⚡", template: "You pressed {weight} lbs! Delivering millions of volts of clean electricity to a major city block." }
    ]
  },
  // 17. weight < 15000 (limit: 15000)
  {
    limit: 15000,
    comparisons: [
      { item: "an ancient Giant Redwood Tree segment", emoji: "🪵", template: "Colossal strength! You moved {weight} lbs! That is equivalent to lifting a massive ancient Giant Redwood segment." },
      { item: "a family of two adult grey whales", emoji: "🐋", template: "You hoisted {weight} lbs! Swimming peacefully through the deep trenches of the Pacific Ocean." },
      { item: "a backup generator bank for a skyscraper", emoji: "🏢", template: "You lifted {weight} lbs! Engineered to keep all passenger elevators running during blackouts." },
      { item: "a polished marble temple colonnade", emoji: "🏛️", template: "You pressed {weight} lbs! Heavy-duty marble columns supporting a grand historical museum roof." },
      { item: "an industrial sheet metal stamping assembly", emoji: "⚙️", template: "You accumulated {weight} lbs! Punching out structural steel beams with extreme force." },
      { item: "an offshore commercial diving habitat", emoji: "🚢", template: "You hoisted {weight} lbs! Built of thick steel to allow deep-sea divers to live underwater." },
      { item: "a stack of cast-iron railway tracks", emoji: "🛤️", template: "You lifted {weight} lbs! Designed to support 100-car cargo trains rolling across states." },
      { item: "a hydroelectric dam mechanical gearset hub", emoji: "⚡", template: "You pressed {weight} lbs! Harnessing the kinetic power of rushing rivers for electricity." },
      { item: "a commercial industrial cold storage facility", emoji: "❄️", template: "You accumulated {weight} lbs! Keeping a whole city's emergency food supply frozen." },
      { item: "a bronze monument of a charging bull", emoji: "🐂", template: "You hoisted {weight} lbs! Standing tall and proud in the center of the financial district." },
      { item: "a concrete bridge foundation column", emoji: "🌉", template: "You lifted {weight} lbs! Anchoring massive steel tension load cables over a deep gorge." },
      { item: "an airport airplane pushback tractor fleet", emoji: "🚜", template: "You pressed {weight} lbs! Five heavy-duty tractors lined up for morning runway service." },
      { item: "a harbor crane container hook block", emoji: "⚓", template: "You accumulated {weight} lbs! Heavy forged block rated to lift full intermodal cargo containers." },
      { item: "a giant sequoia redwood root ball", emoji: "🪵", template: "You hoisted {weight} lbs! A dense network of ancient earth-binding wood and roots." },
      { item: "a drinking water purification dome", emoji: "💧", template: "You lifted {weight} lbs! Processing fresh mountain spring water for a major municipality." },
      { item: "a vintage steam locomotive coal tender", emoji: "🚂", template: "You pressed {weight} lbs! Packed with tons of fuel and water to steam across the country." },
      { item: "an industrial boulder crushing mill", emoji: "🪨", template: "You accumulated {weight} lbs! Pulverizing solid quartzite rocks into industrial grade sand." },
      { item: "a warehouse full of cast-iron kettlebells", emoji: "🏋️", template: "You hoisted {weight} lbs! Literally moving a complete shipping container of heavy iron." },
      { item: "two armored bank transit trucks", emoji: "🚛", template: "You lifted {weight} lbs! Packed to the ceiling with solid silver bullion and security gear." },
      { item: "a high-voltage substation transformer hub", emoji: "⚡", template: "You pressed {weight} lbs! Delivering grid electricity to an entire residential suburb." }
    ]
  },
  // 18. weight >= 15000 (limit: Infinity / 99999999)
  {
    limit: 99999999,
    comparisons: [
      { item: "a Colossal Megalodon Shark", emoji: "🦈", template: "Legendary God Mode! You moved {weight} lbs! That matches the weight of a prehistoric Colossal Megalodon!" },
      { item: "a prehistoric blue whale calf", emoji: "🐋", template: "You hoisted {weight} lbs! Cruising with its giant mother in the vast, open oceans of the world." },
      { item: "a small fleet of three school buses", emoji: "🚌", template: "You lifted {weight} lbs! Parked bumper-to-bumper outside the high school football stadium." },
      { item: "a concrete dam river spillway gate", emoji: "🚧", template: "You pressed {weight} lbs! Steel-plated gate built to hold back billions of gallons of water." },
      { item: "a steel suspension bridge girder section", emoji: "🌉", template: "You accumulated {weight} lbs! Ready to bridge valleys on a high-speed interstate railway." },
      { item: "a space rocket solid fuel booster", emoji: "🚀", template: "You hoisted {weight} lbs! Packed with solid propellant, ready to launch a shuttle into deep space." },
      { item: "a backup generator array for a whole city", emoji: "⚡", template: "You lifted {weight} lbs! Capable of running a major city's emergency hospital system." },
      { item: "a historic steam freight locomotive", emoji: "🚂", template: "You pressed {weight} lbs! Solid iron, steam boilers, and thousands of horsepower of pure muscle." },
      { item: "a solid steel federal reserve vault block", emoji: "🏦", template: "You accumulated {weight} lbs! Protecting the gold reserves of the world's largest banks." },
      { item: "a mechanical bucket-wheel excavator arm", emoji: "🚜", template: "You hoisted {weight} lbs! The largest terrestrial land-moving machine ever designed." },
      { item: "a concrete ocean breakwater harbor pier", emoji: "🧱", template: "You lifted {weight} lbs! Solid concrete engineered to block massive hurricane swells." },
      { item: "three commercial-grade steel pizza ovens", emoji: "🍕", template: "You pressed {weight} lbs! Capable of baking five hundred pizzas an hour for hungry athletes." },
      { item: "a deep-ocean research exploration vessel", emoji: "🚢", template: "You accumulated {weight} lbs! Built to explore the pitch-black trenches of the ocean floor." },
      { item: "a giant sequoia redwood forest tree", emoji: "🪵", template: "You hoisted {weight} lbs! An ancient redwood tree soaring over a ten-story building." },
      { item: "a grid-scale green solar storage battery", emoji: "🔋", template: "You lifted {weight} lbs! Providing clean power to a residential neighborhood for days." },
      { item: "a steam locomotive coal tender car", emoji: "🚂", template: "You pressed {weight} lbs! Packed with fuel, boiler water, and extreme physical momentum." },
      { item: "a solid bronze roaring dragon monument", emoji: "🐉", template: "You accumulated {weight} lbs! An epic mythological structure standing proud in a central plaza." },
      { item: "a municipal metropolitan water reservoir", emoji: "💧", template: "You hoisted {weight} lbs! Delivering pure, clean drinking water to millions of citizens." },
      { item: "an armored main battle tank carrier", emoji: "🚛", template: "You lifted {weight} lbs! Heavy-duty steel and reinforced titanium plating to move battle gear." },
      { item: "a direct-drive offshore wind turbine generator", emoji: "💨", template: "You pressed {weight} lbs! Engineered to capture storm winds and power entire cities." }
    ]
  }
];

export function getWeightComparison(weight: number, displayUnit: 'lbs' | 'kg' = 'lbs'): WeightComparison {
  if (weight <= 0) {
    // Return a random entry from category 1 (limit 0)
    const cat = CATEGORIES[0];
    const index = Math.floor(Math.random() * cat.comparisons.length);
    const comp = cat.comparisons[index];
    return {
      item: comp.item,
      emoji: comp.emoji,
      description: comp.template.replace("{weight}", "0")
    };
  }

  // Find the appropriate category based on the weight limit
  let selectedCat = CATEGORIES[CATEGORIES.length - 1]; // Default to the last category (weight >= 15000)
  for (let i = 1; i < CATEGORIES.length; i++) {
    if (weight < CATEGORIES[i].limit) {
      selectedCat = CATEGORIES[i];
      break;
    }
  }

  // Use a deterministic hash or modulo of the weight to select a stable index out of the 20 comparisons.
  // This makes sure the same weight value always yields the same funny item (real calculator feeling!),
  // while varying across different weights.
  const numericWeight = Math.abs(Math.round(weight));
  const index = numericWeight % selectedCat.comparisons.length;
  const comp = selectedCat.comparisons[index];

  const displayVal = displayUnit === 'kg' ? Math.round(weight * 0.45359237) : Math.round(weight);
  const rawDesc = comp.template.replace("{weight}", displayVal.toLocaleString());
  const description = displayUnit === 'kg' ? rawDesc.replace(/lbs/g, 'kg') : rawDesc;

  return {
    item: comp.item,
    emoji: comp.emoji,
    description
  };
}
