import { Exercise, Workout } from './types';

// Import the images using ESM so Vite bundles them locally in the compiled program
import CHEST_IMAGE from './assets/images/chest_workout_new_1782539284497.jpg';
import BACK_IMAGE from './assets/images/back_workout_new_1782539296209.jpg';
import LEGS_IMAGE from './assets/images/legs_workout_new_1782539307730.jpg';
import CORE_IMAGE from './assets/images/core_workout_new_1782539318396.jpg';
import SHOULDERS_IMAGE from './assets/images/shoulders_workout_1782539077834.jpg';
import ARMS_IMAGE from './assets/images/arms_workout_1782539091571.jpg';
import CARDIO_IMAGE from './assets/images/cardio_workout.jpg';
import CALISTHENICS_IMAGE from './assets/images/calisthenics_workout.jpg';

export const INITIAL_EXERCISES: Exercise[] = [
  // CHEST
  {
    id: 'pushups',
    name: 'Classic Push-Ups',
    muscleGroup: 'Chest',
    description: 'A fundamental bodyweight exercise that builds chest, shoulder, and tricep strength while engaging the core.',
    instructions: [
      'Get down on all fours, placing your hands slightly wider than your shoulders.',
      'Straighten your arms and legs to enter a high plank position. Keep your body in a straight line from head to toe.',
      'Lower your body by bending your elbows until your chest nearly touches the floor. Keep your elbows tucked near a 45-degree angle.',
      'Push through your palms to return to the starting high plank position, keeping your core braced.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'db_bench_press',
    name: 'Dumbbell Bench Press',
    muscleGroup: 'Chest',
    description: 'A premier compound press targeting the pectoral muscles, anterior deltoids, and triceps with freedom of motion.',
    instructions: [
      'Sit on the end of a flat bench with a dumbbell in each hand resting on your thighs.',
      'Lie back on the bench while bringing the dumbbells to the sides of your chest. Plant your feet flat on the floor.',
      'Press the dumbbells straight up over your chest, extending your arms fully but not locking your elbows.',
      'Lower the weights slowly and under control until they are level with your chest, feeling a deep stretch.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 20, // 20 kg or lbs as starting
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'db_incline_press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'Chest',
    description: 'An incline variation of the dumbbell press designed to place higher mechanical tension on the upper clavicular pectorals.',
    instructions: [
      'Adjust an incline bench to roughly 30 to 45 degrees.',
      'Lie back on the bench, lifting the dumbbells to shoulder height with palms facing forward.',
      'Press the weights vertically upwards until your arms are fully extended over your upper chest.',
      'Slowly lower the dumbbells back down to the sides of your shoulders, feeling the stretch.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 16,
    defaultRest: 60,
    type: 'reps'
  },

  // BACK
  {
    id: 'pullups',
    name: 'Deadhang Pull-Ups',
    muscleGroup: 'Back',
    description: 'An elite bodyweight vertical pulling movement that builds back width, lat strength, and grip endurance.',
    instructions: [
      'Grasp a pull-up bar with an overhand grip (palms facing away), hands wider than shoulder-width apart.',
      'Hang with arms fully extended. Pull your shoulder blades down and back (active shoulders).',
      'Pull your chest up toward the bar by driving your elbows down toward your hips.',
      'Continue until your chin clears the bar, hold for a split second, then lower your body back down smoothly.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 8,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'db_rows',
    name: 'One-Arm Dumbbell Rows',
    muscleGroup: 'Back',
    description: 'A unilateral horizontal pull targeting the latissimus dorsi, rhomboids, rear delts, and biceps.',
    instructions: [
      'Place your right knee and right hand flat on a bench, keeping your spine flat and horizontal.',
      'Hold a dumbbell in your left hand with your arm hanging straight down toward the floor.',
      'Pull the dumbbell up toward your lower hip, leading with your elbow and squeezing your back muscles.',
      'Lower the dumbbell with a slow, controlled stretch back to the starting dead-hang position.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 18,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'lat_pulldowns',
    name: 'Seated Lat Pulldown',
    muscleGroup: 'Back',
    description: 'An excellent machine pull that isolates the lats and allows you to adjust weights for high-volume back expansion.',
    instructions: [
      'Sit facing the lat pulldown machine, locking your thighs under the pads. Grasp the bar with a wide overhand grip.',
      'Slightly lean back (about 10 degrees) and pull the bar down toward your collarbone.',
      'Focus on driving your elbows down and back, squeezing your scapulae together at the bottom.',
      'Control the bar as it returns upwards, extending your arms fully to stretch the lats.'
    ],
    image: BACK_IMAGE,
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 45,
    defaultRest: 60,
    type: 'reps'
  },

  // LEGS
  {
    id: 'squats',
    name: 'Bodyweight squats',
    muscleGroup: 'Legs',
    description: 'The foundation of lower-body training. Develops quadriceps, glutes, hamstrings, and core stabilizers.',
    instructions: [
      'Stand with feet shoulder-width apart, toes pointed slightly outward (about 15 degrees).',
      'Inhale, brace your core, and initiate the movement by pushing your hips back as if sitting in a chair.',
      'Lower until your thighs are at least parallel to the floor, keeping your knees tracking inline with your toes.',
      'Exhale and drive through your mid-foot to return to a tall standing posture, squeezing your glutes.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'goblet_squats',
    name: 'Dumbbell Goblet Squats',
    muscleGroup: 'Legs',
    description: 'A front-loaded squat variation that reinforces proper squat mechanics while heavily taxing the quads and core.',
    instructions: [
      'Stand with feet slightly wider than shoulder-width. Hold a dumbbell vertically by one end under your chin, cupping it like a goblet.',
      'Keep your elbows tucked and brace your stomach. Sit down deeply between your hips.',
      'Ensure your elbows go inside your knees at the bottom of the squat.',
      'Drive upward through your heels, keeping your chest upright throughout the movement.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 22,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'lunges',
    name: 'Walking Lunges',
    muscleGroup: 'Legs',
    description: 'An interactive leg workout that builds stability, balances leg development, and stretches hips.',
    instructions: [
      'Stand tall with feet hip-width apart. Rest hands on hips or hold light dumbbells at your sides.',
      'Take a large step forward with your right leg and lower your hips until your rear knee is close to the ground.',
      'Ensure your front knee is bent to 90 degrees and does not slide excessively past your toes.',
      'Push through your front foot to stand up, bringing your trailing leg forward to step directly into the next lunge.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 10, // 10 per leg (total 20 steps)
    defaultWeight: 10,
    defaultRest: 60,
    type: 'reps'
  },

  // CORE / SHOULDERS
  {
    id: 'plank',
    name: 'Isometric Forearm Plank',
    muscleGroup: 'Core',
    description: 'A classic core-strengthening exercise that builds endurance in the abdominals, obliques, shoulders, and lower back.',
    instructions: [
      'Place your forearms on the floor, elbows aligned directly under your shoulders, and feet hip-width apart.',
      'Raise your torso to create a straight, rigid plank from your heels to the crown of your head.',
      'Do not let your hips sag toward the ground or flare up in the air; keep your pelvis neutral.',
      'Squeeze your glutes, press your elbows into the ground, and hold this position while breathing deeply.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultRest: 60,
    type: 'time',
    defaultDuration: 60 // 60 seconds
  },
  {
    id: 'db_shoulder_press',
    name: 'Seated Dumbbell Shoulder Press',
    muscleGroup: 'Shoulders',
    description: 'The definitive vertical press for targeting the anterior and lateral heads of the deltoids, plus upper chest and triceps.',
    instructions: [
      'Set an adjustable bench to an upright 90-degree angle, or sit tall on a flat bench.',
      'Hold dumbbells at shoulder height with an overhand grip (palms facing forward), elbows bent at 90 degrees.',
      'Press the dumbbells straight up in an arc until they meet over your head, fully extending your arms.',
      'Slowly lower the weights back to shoulder level, maintaining control and preventing any bouncing.'
    ],
    image: SHOULDERS_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 14,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'leg_raises',
    name: 'Lying Leg Raises',
    muscleGroup: 'Core',
    description: 'An intense lower-abdominal targeting exercise that builds deep hip flexor strength and core bracing capacity.',
    instructions: [
      'Lie flat on your back on a mat, arms at your sides, palms flat on the floor.',
      'Keep your legs straight and pressed together. Brace your core and press your lower back firmly into the floor.',
      'Slowly lift your legs up towards the ceiling until they are vertical (90 degrees at the hip).',
      'Slowly lower your legs back down until they are 2-3 inches above the floor, then hold and repeat.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },
  // WIKIPEDIA WEIGHT TRAINING EXERCISES
  {
    id: 'barbell_bench_press',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    description: 'The standard upper body compound exercise targeting the pectoralis major, anterior deltoids, and triceps.',
    instructions: [
      'Lie flat on a bench with your feet flat on the floor. Grip the barbell with hands slightly wider than shoulder-width.',
      'Unrack the barbell, holding it directly over your chest with elbows locked.',
      'Lower the bar slowly to your mid-chest level, keeping your elbows at roughly a 45-degree angle.',
      'Press the bar powerfully back up to the starting position, extending your arms fully.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 135,
    defaultRest: 90,
    type: 'reps'
  },
  {
    id: 'chest_flyes',
    name: 'Dumbbell Chest Flyes',
    muscleGroup: 'Chest',
    description: 'An isolation movement designed to stretch and stimulate the chest muscles without involvement of the triceps.',
    instructions: [
      'Lie on a flat bench holding dumbbells directly above your chest with palms facing each other.',
      'With a slight bend in your elbows, lower your arms out to the sides in a wide arc until you feel a stretch in your chest.',
      'Squeeze your pectorals to return the dumbbells back to the starting position along the same wide arc path.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'barbell_back_squat',
    name: 'Barbell Back Squat',
    muscleGroup: 'Legs',
    description: 'The king of lower body compound exercises, targeting the quadriceps, glutes, hamstrings, and lower back.',
    instructions: [
      'Rest the barbell across your upper back/traps. Stand with feet shoulder-width apart, toes slightly flared.',
      'Unrack the bar, take a step back, brace your core, and bend at your hips and knees to squat down.',
      'Lower until your hips go below parallel with your knees, keeping your chest proud and spine neutral.',
      'Drive upwards through the mid-foot back to a standing position, squeezing your glutes at the top.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 185,
    defaultRest: 90,
    type: 'reps'
  },
  {
    id: 'romanian_deadlift',
    name: 'Romanian Deadlift (RDL)',
    muscleGroup: 'Legs',
    description: 'A premiere posterior chain movement emphasizing the hamstrings, gluteus maximus, and erector spinae.',
    instructions: [
      'Stand holding a barbell or dumbbells in front of your thighs. Keep feet hip-width apart and knees slightly unlocked.',
      'Hinge at your hips, pushing them backwards as you lower the weights along the front of your shins.',
      'Keep a flat back and descend until you feel a strong stretch in your hamstrings (usually mid-shin level).',
      'Drive your hips forward and squeeze your glutes to return to a tall standing position.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 115,
    defaultRest: 75,
    type: 'reps'
  },
  {
    id: 'standing_calf_raises',
    name: 'Standing Calf Raises',
    muscleGroup: 'Legs',
    description: 'A targeted isolation exercise for developing the gastrocnemius muscle of the calves.',
    instructions: [
      'Stand on the edge of a raised platform or step with the balls of your feet, letting your heels hang off.',
      'Lower your heels as far as comfortable to feel a deep stretch in your calf muscles.',
      'Press through the balls of your feet to raise your heels as high as possible, squeezing the calves at the peak.',
      'Control the descent back down to the stretched position.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 0,
    defaultRest: 45,
    type: 'reps'
  },
  {
    id: 'barbell_row',
    name: 'Bent-Over Barbell Row',
    muscleGroup: 'Back',
    description: 'A powerful horizontal pulling movement targeting the latissimus dorsi, rhomboids, traps, and biceps.',
    instructions: [
      'Hold a barbell with an overhand grip, feet hip-width apart. Bend your knees slightly and hinge forward at your hips (45 degrees).',
      'Let the bar hang at arm\'s length in front of you with your spine completely straight.',
      'Pull the bar up toward your lower chest/belly button by driving your elbows up and squeezing your shoulder blades.',
      'Slowly lower the barbell back down under control to the starting dead-hang.'
    ],
    image: BACK_IMAGE,
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 95,
    defaultRest: 75,
    type: 'reps'
  },
  {
    id: 'db_lateral_raise',
    name: 'Dumbbell Lateral Raise',
    muscleGroup: 'Shoulders',
    description: 'The premium isolation movement for lateral deltoid development, creating shoulder width and capped delts.',
    instructions: [
      'Stand tall holding a dumbbell in each hand at your sides, palms facing inwards.',
      'With a very slight bend in your elbows, raise the weights out to your sides in a wide arc.',
      'Stop when your arms are parallel to the floor (shoulder level), with your pinky fingers slightly tilted upwards.',
      'Slowly lower the dumbbells back down to your sides, maintaining constant muscle tension.'
    ],
    image: SHOULDERS_IMAGE,
    defaultSets: 4,
    defaultReps: 12,
    defaultWeight: 10,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'barbell_bicep_curl',
    name: 'Barbell Bicep Curl',
    muscleGroup: 'Arms',
    description: 'A legendary upper-arm isolation exercise targeting the biceps brachii for size and peak power.',
    instructions: [
      'Stand tall holding a barbell with an underhand grip (palms facing forward), hands shoulder-width apart.',
      'Keep your elbows tucked close to your torso and chest upright.',
      'Curl the bar upwards toward your shoulders by flexing your biceps, keeping your upper arms stationary.',
      'Lower the bar slowly back to the starting position, extending your arms fully.'
    ],
    image: ARMS_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 45,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'dumbbell_hammer_curl',
    name: 'Dumbbell Hammer Curl',
    muscleGroup: 'Arms',
    description: 'A bicep variation that places heavy emphasis on the brachialis and brachioradialis muscles for forearm and upper arm thickness.',
    instructions: [
      'Stand holding dumbbells at your sides with a neutral grip (palms facing each other).',
      'Keep your elbows locked to your sides and curl the weights up while keeping palms facing each other.',
      'Squeeze your biceps and forearms at the top, then slowly lower the weights back down.'
    ],
    image: ARMS_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 15,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'db_overhead_tricep_ext',
    name: 'Overhead Dumbbell Tricep Extension',
    muscleGroup: 'Arms',
    description: 'An overhead triceps movement that places a significant stretch on the long head of the triceps brachii.',
    instructions: [
      'Stand or sit on a bench. Hold a single heavy dumbbell vertically with both hands cupping the inner plate over your head.',
      'Keep your elbows tucked close to your ears and pointing forward.',
      'Lower the dumbbell slowly behind your head by bending only at the elbows.',
      'Press the dumbbell back up to the overhead starting position, squeezing your triceps fully.'
    ],
    image: ARMS_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 25,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'hanging_knee_raise',
    name: 'Hanging Knee Raises',
    muscleGroup: 'Core',
    description: 'An advanced core exercise performed on a pull-up bar, targeting the lower abdominals and hip flexors.',
    instructions: [
      'Hang from a pull-up bar with arms fully extended. Keep your body steady without swinging.',
      'Exhale and raise your knees toward your chest by flexing your hips and curling your pelvis upwards.',
      'Squeeze your abs at the top of the movement, then slowly lower your knees back to the start.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },
  // MANITOBA GRADE 11 PE RESISTANCE TRAINING PLANNER EXERCISES
  {
    id: 'chest_press_machine',
    name: 'Chest Press Machine',
    muscleGroup: 'Chest',
    description: 'A machine-based compound movement that isolates the pectorals while providing stability and safety for heavy lifting.',
    instructions: [
      'Adjust the seat height so the handles are aligned with your mid-chest.',
      'Sit with your back and head pressed firmly against the pad, feet flat on the floor.',
      'Grasp the handles with an overhand grip, elbows bent.',
      'Press the handles forward under control, extending your arms but not locking your elbows.',
      'Slowly return to the starting position without letting the weights touch.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 40,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'decline_bench_press',
    name: 'Decline Bench Press',
    muscleGroup: 'Chest',
    description: 'A chest press variant on a decline bench to target the lower pectoralis major fibers with reduced shoulder strain.',
    instructions: [
      'Secure your legs at the end of a decline bench and lie back completely.',
      'Unrack the barbell, holding it directly above your lower chest with elbows locked.',
      'Lower the bar slowly under control until it lightly touches your lower chest.',
      'Drive the bar back up to the starting position, extending your arms fully.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 95,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'seated_cable_row',
    name: 'Seated Cable Row',
    muscleGroup: 'Back',
    description: 'A cable pulling movement focusing on mid-back depth, targeting the rhomboids, latissimus dorsi, and middle traps.',
    instructions: [
      'Sit on the row platform, place your feet on the footrests, and keep your knees slightly bent.',
      'Grasp the handle, sit upright with a flat back, and pull your shoulder blades back.',
      'Pull the handle toward your lower abdomen, driving your elbows backward and squeezing your shoulder blades.',
      'Slowly extend your arms back to the starting position under control, keeping your chest up.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 40,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'back_extensions',
    name: 'Back Extensions (Hyperextensions)',
    muscleGroup: 'Back',
    description: 'An excellent posterior chain exercise targeting the lower back (erector spinae), glutes, and hamstrings.',
    instructions: [
      'Position yourself in a hyperextension bench, placing your thighs flat against the upper pad.',
      'Cross your arms over your chest or place your hands behind your head.',
      'Slowly bend forward at your waist, lowering your upper body while keeping your back flat.',
      'Contract your lower back and glutes to raise your torso back up until your body is in a straight line.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'shoulder_press_machine',
    name: 'Shoulder Press Machine',
    muscleGroup: 'Shoulders',
    description: 'An isolated vertical pressing machine targeting the front and side deltoids with guided motion for maximum muscle load.',
    instructions: [
      'Adjust the seat so the handles are at shoulder height.',
      'Sit back flat against the pad, feet flat on the floor, and grasp the handles with an overhand grip.',
      'Press the handles vertically upward until your arms are fully extended but not locked.',
      'Slowly lower the weights back to the starting position under control.'
    ],
    image: SHOULDERS_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 30,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'front_dumbbell_raise',
    name: 'Front Dumbbell Raise',
    muscleGroup: 'Shoulders',
    description: 'An isolation movement focusing on the anterior deltoids to build full, rounded shoulders.',
    instructions: [
      'Stand tall holding dumbbells in front of your thighs with palms facing your body.',
      'Keep your torso stationary and raise the dumbbells forward in a slow, controlled motion.',
      'Stop when your arms are parallel to the floor (shoulder level), hold for a brief second.',
      'Slowly lower the dumbbells back down to your thighs under control.'
    ],
    image: SHOULDERS_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 8,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'upright_row',
    name: 'Barbell Upright Row',
    muscleGroup: 'Shoulders',
    description: 'A classic shoulder pull targeting the lateral deltoids and traps to build shoulder width.',
    instructions: [
      'Stand tall holding a barbell with an overhand grip, hands slightly narrower than shoulder-width.',
      'Keep the bar close to your body as you pull it vertically toward your chest.',
      'Lead with your elbows, raising them higher than your shoulders.',
      'Slowly lower the barbell back down under control to the starting position.'
    ],
    image: SHOULDERS_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 45,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'leg_press',
    name: 'Leg Press Machine',
    muscleGroup: 'Legs',
    description: 'A safe, stable lower body compound exercise targeting the quadriceps, glutes, and hamstrings with high capacity for load.',
    instructions: [
      'Sit flat in the leg press seat and place your feet flat on the sled platform about shoulder-width apart.',
      'Disengage the safety locks and slowly lower the platform toward your chest by bending your knees to 90 degrees.',
      'Push through your mid-foot and heels to drive the platform away, extending your legs but leaving a slight bend in the knees.',
      'Engage the safety locks upon completing your sets.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 180,
    defaultRest: 90,
    type: 'reps'
  },
  {
    id: 'leg_extensions',
    name: 'Leg Extension Machine',
    muscleGroup: 'Legs',
    description: 'An isolation movement designed to sculpt the quadriceps and build knee stability under controlled resistance.',
    instructions: [
      'Sit on the machine, adjust the backrest so your knees line up with the pivot point.',
      'Hook your lower shins under the padded roller and hold the side handles for stability.',
      'Extend your legs upward fully, flexing your quadriceps at the peak for a split second.',
      'Slowly lower the padded roller back to the starting position, maintaining tension throughout.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 45,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'leg_curls',
    name: 'Leg Curl Machine',
    muscleGroup: 'Legs',
    description: 'An isolation movement designed to build strength and thickness in the hamstrings, balancing knee health.',
    instructions: [
      'Adjust the machine backrest or lie flat depending on the machine type, placing your lower calves on the roller.',
      'Grasp the handles to stabilize your upper body and keep your pelvis neutral.',
      'Pull your heels toward your glutes by flexing your hamstrings, squeezing hard at the peak of the curl.',
      'Slowly extend your legs back to the starting position under complete control.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 35,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'seated_calf_raises',
    name: 'Seated Calf Raises',
    muscleGroup: 'Legs',
    description: 'A specific calf isolation targeting the soleus muscle, helping to build calf thickness and ankle support.',
    instructions: [
      'Sit in the machine and place the balls of your feet on the platform with heels hanging off.',
      'Position the thigh pad securely over your lower thighs and release the safety lever.',
      'Lower your heels as far as possible to feel a deep stretch in the calf muscles.',
      'Raise your heels as high as possible, squeezing your calves, then slowly lower them.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 25,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'tricep_pushdowns',
    name: 'Triceps Cable Pushdown',
    muscleGroup: 'Arms',
    description: 'A classic cable exercise targeting the lateral and medial heads of the triceps for upper arm thickness.',
    instructions: [
      'Attach a bar or rope to a high pulley. Stand facing the machine, knees slightly bent, elbows tucked to your sides.',
      'Grasp the handle and push it downward by extending your arms fully, keeping your elbows locked in place.',
      'Squeeze your triceps at the bottom of the movement.',
      'Slowly allow the handle to return to chest height under control without moving your elbows.'
    ],
    image: ARMS_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'bench_dips',
    name: 'Bench Dips',
    muscleGroup: 'Arms',
    description: 'An effective bodyweight movement targeting the triceps, anterior shoulders, and upper pectorals.',
    instructions: [
      'Sit on the edge of a bench and place your hands directly next to your hips, fingers pointing forward.',
      'Extend your legs out in front of you, placing your heels on the floor and sliding your hips off the bench.',
      'Lower your body by bending your elbows until your upper arms are roughly parallel to the floor.',
      'Push through your palms to return to the starting position, squeezing your triceps.'
    ],
    image: ARMS_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'preacher_curl',
    name: 'Preacher Bicep Curl',
    muscleGroup: 'Arms',
    description: 'An isolated bicep movement using a preacher bench that prevents cheating or swinging to target the bicep peak.',
    instructions: [
      'Sit on a preacher bench and rest your upper arms flat against the padded support.',
      'Grasp a barbell or dumbbell with an underhand grip.',
      'Curl the weight upward toward your shoulders, keeping your upper arms glued to the pad.',
      'Slowly lower the weight back to full extension, maintaining tension throughout.'
    ],
    image: ARMS_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 35,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'concentration_curl',
    name: 'Concentration Curl',
    muscleGroup: 'Arms',
    description: 'A premium unilateral bicep isolation movement that emphasizes the bicep peak and sleeve thickness.',
    instructions: [
      'Sit on the edge of a bench with feet wide, holding a dumbbell in one hand.',
      'Brace your elbow against the inside of your thigh on the same side.',
      'Curl the dumbbell upward toward your face, contracting your bicep fully at the peak.',
      'Slowly lower the dumbbell back down to the starting position.'
    ],
    image: ARMS_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 12,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'abdominal_crunch',
    name: 'Abdominal Crunch',
    muscleGroup: 'Core',
    description: 'A fundamental core exercise targeting the rectus abdominis to build abdominal strength and definition.',
    instructions: [
      'Lie flat on your back with knees bent and feet flat on the floor, hip-width apart.',
      'Place your hands lightly behind your head, keeping your elbows wide.',
      'Exhale, pull your belly button to your spine, and lift your shoulders off the floor, curling forward.',
      'Inhale as you slowly lower back down under control.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 0,
    defaultRest: 45,
    type: 'reps'
  },
  {
    id: 'russian_twists',
    name: 'Russian Twists',
    muscleGroup: 'Core',
    description: 'A classic dynamic rotation exercise targeting the obliques, rectus abdominis, and deep core stabilizers.',
    instructions: [
      'Sit on the floor, bend your knees, and lift your feet a few inches off the ground to balance on your tailbone.',
      'Hold your hands together in front of your chest (or hold a weight).',
      'Twist your torso to the right, tapping your hands or weight to the floor next to your hip.',
      'Twist back to the left and tap the floor, maintaining a braced core throughout.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 20,
    defaultWeight: 0,
    defaultRest: 45,
    type: 'reps'
  },
  {
    id: 'cable_woodchop',
    name: 'Cable Woodchop',
    muscleGroup: 'Core',
    description: 'A highly functional rotational cable exercise that builds power, athletic stability, and oblique strength.',
    instructions: [
      'Stand sideways next to a high cable pulley, holding the handle with both hands.',
      'Step slightly away from the machine, keeping your feet shoulder-width apart and knees slightly bent.',
      'Pull the cable diagonally downward and across your body to your opposite knee, rotating your torso.',
      'Slowly return to the starting position, controlling the weight.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 15,
    defaultRest: 60,
    type: 'reps'
  },
  // NEW GYM MACHINE EXERCISES
  {
    id: 'pec_dec_fly_machine',
    name: 'Pec Dec Fly Machine',
    muscleGroup: 'Chest',
    description: 'An excellent chest isolation machine designed to target the inner and outer pectorals with consistent resistance.',
    instructions: [
      'Sit flat against the backrest of the pec dec machine, grasping the vertical handles.',
      'Squeeze your chest together to bring the vertical arms of the machine together in front of you.',
      'Hold the contraction at the center for a second, feeling the peak pectoral squeeze.',
      'Slowly open your arms to return to the wide starting position, maintaining constant tension.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 30,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'cable_crossover_machine',
    name: 'Cable Crossover Machine',
    muscleGroup: 'Chest',
    description: 'A versatile dual-cable machine exercise that places deep stretch and constant contraction on the chest fibers.',
    instructions: [
      'Set the pulleys at a high position, select a suitable weight, and hold the handles.',
      'Step forward in between the pulleys, lean slightly forward, and brace your core.',
      'With a slight bend in your elbows, sweep your arms downward and inward in an arc until hands meet.',
      'Slowly reverse the movement to return to the starting stretched position.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'incline_chest_press_machine',
    name: 'Incline Machine Chest Press',
    muscleGroup: 'Chest',
    description: 'A guided incline machine focusing heavily on the upper chest fibers for maximum safe press loading.',
    instructions: [
      'Adjust the seat so the handles are aligned slightly below your upper chest.',
      'Brace your feet on the ground and sit with your back flat against the pad.',
      'Push the handles forward and upward under complete control, extending your arms.',
      'Slowly lower the weight back to the starting point without let-down.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 35,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'decline_press_machine',
    name: 'Decline Press Machine',
    muscleGroup: 'Chest',
    description: 'A specialized machine press optimized for targeting the lower pectorals with reduced load on the shoulders.',
    instructions: [
      'Adjust the seat to comfortably reach the lower-angled handles.',
      'Press your head and back firmly into the back pad and brace your feet.',
      'Push the handles outward, fully contracting the lower portion of your chest.',
      'Slowly return the handles back to the starting position.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 40,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'smith_machine_flat_press',
    name: 'Smith Machine Flat Press',
    muscleGroup: 'Chest',
    description: 'A barbell bench press executed on a stable vertical tracking system, allowing safe failure and heavy pectoral loading.',
    instructions: [
      'Position a flat bench in the center of the Smith Machine.',
      'Lie flat, line up your chest with the bar, and unrack the bar at arm\'s length.',
      'Lower the bar slowly to your chest, pausing briefly.',
      'Drive the bar back up vertically, extending your arms but not locking your elbows.'
    ],
    image: CHEST_IMAGE,
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 75,
    defaultRest: 90,
    type: 'reps'
  },
  {
    id: 'assisted_pullup_machine',
    name: 'Machine Assisted Pull-Up',
    muscleGroup: 'Back',
    description: 'Uses weight stack counter-balance to assist in vertical pulling, building vertical volume and back width.',
    instructions: [
      'Select your desired assist weight (higher weight makes the exercise easier).',
      'Kneel on the padded platform and grasp the wide handles overhead.',
      'Pull your body upwards by driving your elbows down, raising your chest to handle height.',
      'Slowly lower your body back down to full arm extension.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 40,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 't_bar_row_machine',
    name: 'T-Bar Row Machine',
    muscleGroup: 'Back',
    description: 'A chest-supported leverage machine that targets mid-back thickness and lats without straining the lower spine.',
    instructions: [
      'Lie face-down on the padded chest support, placing your feet flat on the footrests.',
      'Grasp the handles with your preferred grip (wide or close-neutral).',
      'Pull the weight upward, lifting your elbows as high as possible and squeezing your shoulder blades.',
      'Slowly lower the weight back down to full arm extension.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 30,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'leverage_high_row',
    name: 'Leverage High Row Machine',
    muscleGroup: 'Back',
    description: 'A divergent pulling angle machine optimizing lat width and upper-back squeeze.',
    instructions: [
      'Adjust the seat and thigh pads so you are securely anchored.',
      'Reach up and grasp the handles with an overhand or neutral grip.',
      'Pull the handles downward and back, drawing your elbows to your sides and squeezing your lats.',
      'Slowly return the handles to the starting stretched position.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 35,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'reverse_pec_dec_machine',
    name: 'Reverse Pec Dec Machine',
    muscleGroup: 'Back',
    description: 'An exceptional isolation machine targeting the rear deltoids, rhomboids, and lower traps.',
    instructions: [
      'Sit facing the pad of the pec dec machine, adjusting the handles so they are at shoulder height.',
      'Hold the handles and pull your arms back in a wide arc, squeezing your upper back muscles.',
      'Pause at the end of the motion, then slowly return to the starting position.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 15,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'close_grip_lat_pulldown_machine',
    name: 'Close Grip Lat Pulldown',
    muscleGroup: 'Back',
    description: 'A lat pulldown variation using a close neutral V-bar attachment to maximize lat stretch and range of motion.',
    instructions: [
      'Attach a V-bar handle to the lat pulldown pulley. Secure your thighs under the pads.',
      'Hold the handle and pull it directly down toward your chest, leaning back slightly.',
      'Drive your elbows downward, squeezing your lats hard at the bottom.',
      'Control the ascent, feeling the lats fully stretch at the top.'
    ],
    image: BACK_IMAGE,
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 45,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'cable_straight_arm_pulldown',
    name: 'Cable Straight-Arm Pulldown',
    muscleGroup: 'Back',
    description: 'An isolation exercise targeting the lats and teres major without bicep involvement under continuous cable load.',
    instructions: [
      'Attach a straight bar or rope to a high pulley. Stand a step back with knees slightly bent.',
      'Hold the bar with arms fully extended and hinge forward slightly at your hips.',
      'Pull the bar down in an arc to your thighs, keeping your arms straight and squeezing your lats.',
      'Slowly raise the bar back to the starting overhead position, feeling the lat stretch.'
    ],
    image: BACK_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'hack_squat_machine',
    name: 'Hack Squat Machine',
    muscleGroup: 'Legs',
    description: 'A plate-loaded sliding machine that takes pressure off the lower back to fully isolate the quadriceps.',
    instructions: [
      'Position your back and shoulders against the pads of the carriage, placing feet flat on the platform.',
      'Release the safety handles and bend your knees to squat down to a 90-degree angle.',
      'Push through your mid-foot to drive the weight carriage up, extending your legs.',
      'Lock the safety handles once you complete your set.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 90,
    defaultRest: 90,
    type: 'reps'
  },
  {
    id: 'lying_leg_curl_machine',
    name: 'Lying Leg Curl Machine',
    muscleGroup: 'Legs',
    description: 'Isolates the hamstrings in a lying flat position, maximizing hamstring contraction throughout the full range of motion.',
    instructions: [
      'Lie face down on the machine, positioning the roller pad just below your calf muscles.',
      'Grasp the side handles to stabilize your body.',
      'Exhale and curl your legs upward toward your glutes as far as comfortable.',
      'Slowly lower the roller back down under control to the start.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 30,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'smith_machine_squat',
    name: 'Smith Machine Squat',
    muscleGroup: 'Legs',
    description: 'Guided track squats that allow foot placement adjustments to emphasize the quadriceps or glutes under heavy load safely.',
    instructions: [
      'Set the bar to shoulder height. Stand under the bar, placing it on your traps.',
      'Step slightly forward to place your feet hip-width apart and unrack the bar.',
      'Squat down by hinging your hips and bending knees until thighs are parallel to the platform.',
      'Drive upwards back to standing, keeping your spine straight.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 80,
    defaultRest: 90,
    type: 'reps'
  },
  {
    id: 'standing_calf_raise_machine',
    name: 'Standing Calf Raise Machine',
    muscleGroup: 'Legs',
    description: 'An excellent machine utilizing direct shoulder weight stacks to fully overload and stretch the calf muscles.',
    instructions: [
      'Place your shoulders under the pads and step onto the foot block with the balls of your feet.',
      'Lower your heels toward the floor as far as possible to feel a deep calf stretch.',
      'Push through the balls of your feet to raise your heels as high as possible.',
      'Slowly lower your heels back to the starting stretched position.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 40,
    defaultRest: 45,
    type: 'reps'
  },
  {
    id: 'hip_abduction_machine',
    name: 'Hip Abduction Machine',
    muscleGroup: 'Legs',
    description: 'An isolation machine targeting the gluteus medius and tensor fasciae latae to build hip stability.',
    instructions: [
      'Sit comfortably on the machine with your outer thighs resting against the pads.',
      'Press your legs outward as wide as possible against the resistance pads.',
      'Squeeze your outer glutes at the peak of the motion.',
      'Slowly return your legs back to the starting position.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 30,
    defaultRest: 45,
    type: 'reps'
  },
  {
    id: 'hip_adduction_machine',
    name: 'Hip Adduction Machine',
    muscleGroup: 'Legs',
    description: 'An isolation machine focusing on the inner thigh adductor muscles to build balance and athletic power.',
    instructions: [
      'Sit on the machine, adjusting the starting position so your inner thighs rest against the pads with a wide stretch.',
      'Squeeze your thighs together until the pads meet in the center.',
      'Hold the contraction, then slowly return to the wide stretched position.'
    ],
    image: LEGS_IMAGE,
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 30,
    defaultRest: 45,
    type: 'reps'
  },
  {
    id: 'ab_crunch_machine',
    name: 'Abdominal Crunch Machine',
    muscleGroup: 'Core',
    description: 'A plate-loaded or weight-stack machine that guides abdominal flexion for consistent resistance on the rectus abdominis.',
    instructions: [
      'Sit in the machine, placing your chest against the pads and grabbing the handles.',
      'Exhale and contract your abdominals, curling your upper body downward toward your knees.',
      'Pause and squeeze your abs at the bottom of the movement.',
      'Slowly return back to the upright starting position.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 25,
    defaultRest: 45,
    type: 'reps'
  },
  {
    id: 'cable_ab_crunch',
    name: 'Cable Abdominal Crunch',
    muscleGroup: 'Core',
    description: 'Performed on your knees using a rope attachment to pull weight stack resistance through abdominal flexion.',
    instructions: [
      'Attach a rope to a high pulley. Kneel on the floor facing the machine, holding the rope ends by your ears.',
      'Keep your hips pinned high and contract your abs, pulling your elbows down to your thighs.',
      'Curl your spine, feeling the squeeze in your core.',
      'Slowly return to the upright starting position, keeping the tension on your abs.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 30,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'rotary_torso_machine',
    name: 'Rotary Torso Machine',
    muscleGroup: 'Core',
    description: 'Isolates trunk rotation to target and strengthen the obliques and transverse abdominis with guided safety.',
    instructions: [
      'Sit in the machine, locking your thighs and chest against the pads. Select a light weight.',
      'Exhale and rotate your entire upper body to one side, leading with your obliques.',
      'Control the return to the center, then perform rotation to the opposite side.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 20,
    defaultRest: 45,
    type: 'reps'
  },
  {
    id: 'captains_chair_machine',
    name: 'Captain\'s Chair Leg Raise Machine',
    muscleGroup: 'Core',
    description: 'A solid vertical tower machine that isolates the lower abs by supporting your forearms and back while raising legs.',
    instructions: [
      'Mount the tower by resting your forearms on the padded supports and pressing your back flat against the pad.',
      'Let your legs hang straight down.',
      'Brace your core and slowly lift your knees toward your chest (or keep legs straight for an advanced challenge).',
      'Lower your legs slowly back down without swinging.'
    ],
    image: CORE_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },

  // CALISTHENICS
  {
    id: 'cali_pullups',
    name: 'Deadhang Pull-Ups (Calisthenics)',
    muscleGroup: 'Calisthenics',
    description: 'A classic bodyweight pull exercise to develop upper back width, lats, and biceps control.',
    instructions: [
      'Grasp the bar with an overhand grip slightly wider than shoulder-width.',
      'Start from a dead hang with straight arms, pulling your shoulders back and down.',
      'Pull your chest up to the bar, driving your elbows down toward your hips.',
      'Lower yourself slowly back down to a full hang before starting the next rep.'
    ],
    image: CALISTHENICS_IMAGE,
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 0,
    defaultRest: 90,
    type: 'reps'
  },
  {
    id: 'cali_pushups',
    name: 'Core-Braced Push-Ups (Calisthenics)',
    muscleGroup: 'Calisthenics',
    description: 'A fundamental bodyweight pushing pattern targeting chest, shoulders, and absolute core stability.',
    instructions: [
      'Set your hands flat on the floor, slightly wider than shoulder-width.',
      'Maintain a rigid plank position by squeezing your glutes and bracing your abs.',
      'Lower your chest until it nearly touches the floor, keeping elbows tucked close to your body.',
      'Press through your palms to return to the starting position without sagging your lower back.'
    ],
    image: CALISTHENICS_IMAGE,
    defaultSets: 4,
    defaultReps: 15,
    defaultWeight: 0,
    defaultRest: 60,
    type: 'reps'
  },
  {
    id: 'cali_dips',
    name: 'Parallel Bar Dips',
    muscleGroup: 'Calisthenics',
    description: 'An elite bodyweight pushing exercise that isolates the chest, triceps, and anterior shoulders.',
    instructions: [
      'Support your bodyweight on the parallel bars with straight arms and locked elbows.',
      'Lower your body by bending your elbows until your shoulders are slightly below your elbows.',
      'Lean your torso slightly forward to target the chest, or keep upright for more triceps isolation.',
      'Press upward to return to the starting support position, fully extending your arms.'
    ],
    image: CALISTHENICS_IMAGE,
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 0,
    defaultRest: 90,
    type: 'reps'
  },
  {
    id: 'cali_muscleups',
    name: 'Strict Muscle-Up',
    muscleGroup: 'Calisthenics',
    description: 'An advanced calisthenics skill combining a powerful explosive pull-up with a transition into a bar dip.',
    instructions: [
      'Grasp the bar with a false grip (resting the wrists on top of the bar for easier transition).',
      'Perform an explosive pull-up, pulling the bar down to your lower chest/abdomen.',
      'Lean your head and shoulders forward over the bar, transitioning your elbows from below to above the bar.',
      'Press out into a bar dip support position, locking out your arms at the top.'
    ],
    image: CALISTHENICS_IMAGE,
    defaultSets: 3,
    defaultReps: 3,
    defaultWeight: 0,
    defaultRest: 120,
    type: 'reps'
  },
  {
    id: 'cardio_walking',
    name: 'Walking',
    muscleGroup: 'Cardio',
    description: 'Track walking routes, pace, elevation, and distance using GPS tracking or countdown timers.',
    instructions: ['Active outdoor tracking session.'],
    image: CARDIO_IMAGE,
    defaultSets: 1,
    defaultRest: 0,
    type: 'cardio',
    defaultDuration: 1800,
    defaultDistance: 5.0,
    cardioType: 'Walking'
  },
  {
    id: 'cardio_running',
    name: 'Running',
    muscleGroup: 'Cardio',
    description: 'Run tracking with real-time speed, average pace calculation, live GPS path overlays, and altimeter.',
    instructions: ['Active outdoor tracking session.'],
    image: CARDIO_IMAGE,
    defaultSets: 1,
    defaultRest: 0,
    type: 'cardio',
    defaultDuration: 1800,
    defaultDistance: 5.0,
    cardioType: 'Running'
  },
  {
    id: 'cardio_sprinting',
    name: 'Sprinting',
    muscleGroup: 'Cardio',
    description: 'High-intensity sprinting tracker with lap stopwatches and distance markers.',
    instructions: ['Active outdoor tracking session.'],
    image: CARDIO_IMAGE,
    defaultSets: 1,
    defaultRest: 0,
    type: 'cardio',
    defaultDuration: 600,
    defaultDistance: 1.0,
    cardioType: 'Sprinting'
  },
  {
    id: 'cardio_cycling',
    name: 'Cycling',
    muscleGroup: 'Cardio',
    description: 'Cycle training session logging routes, elevation profiles, and top speeds.',
    instructions: ['Active outdoor tracking session.'],
    image: CARDIO_IMAGE,
    defaultSets: 1,
    defaultRest: 0,
    type: 'cardio',
    defaultDuration: 3600,
    defaultDistance: 15.0,
    cardioType: 'Cycling'
  },
  {
    id: 'cardio_paddleboarding',
    name: 'Paddleboarding',
    muscleGroup: 'Cardio',
    description: 'Outdoor paddle session tracking core stability, coordinates, and duration.',
    instructions: ['Active outdoor tracking session.'],
    image: CARDIO_IMAGE,
    defaultSets: 1,
    defaultRest: 0,
    type: 'cardio',
    defaultDuration: 1800,
    defaultDistance: 3.0,
    cardioType: 'Paddleboarding'
  },
  {
    id: 'cardio_hiking',
    name: 'Hiking',
    muscleGroup: 'Cardio',
    description: 'Track hiking trails, elevation change, distance, and routes with topographic/terrain maps showing hills, mountains, and creeks.',
    instructions: ['Active outdoor tracking session.'],
    image: CARDIO_IMAGE,
    defaultSets: 1,
    defaultRest: 0,
    type: 'cardio',
    defaultDuration: 7200,
    defaultDistance: 8.0,
    cardioType: 'Hiking'
  }
];

export const PREMADE_WORKOUTS: Workout[] = [
  {
    id: 'chest_day',
    name: 'Chest Workout',
    description: 'An intense pressing routine focused on developing maximum chest volume, strength, and endurance.',
    muscleGroup: 'Chest',
    exercises: [
      {
        id: 'cd_1',
        exerciseId: 'db_bench_press',
        name: 'Dumbbell Bench Press',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'db_bench_press')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 20, isCompleted: false },
          { setId: 2, reps: 10, weight: 20, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false },
          { setId: 4, reps: 8, weight: 22, isCompleted: false }
        ]
      },
      {
        id: 'cd_2',
        exerciseId: 'db_incline_press',
        name: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'db_incline_press')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 16, isCompleted: false },
          { setId: 2, reps: 10, weight: 16, isCompleted: false },
          { setId: 3, reps: 10, weight: 16, isCompleted: false }
        ]
      },
      {
        id: 'cd_3',
        exerciseId: 'pushups',
        name: 'Classic Push-Ups',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'pushups')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 15, weight: 0, isCompleted: false },
          { setId: 2, reps: 12, weight: 0, isCompleted: false },
          { setId: 3, reps: 10, weight: 0, isCompleted: false }
        ]
      }
    ]
  },
  // CHEST MACHINE ROUTINES
  {
    id: 'machine_chest_1',
    name: 'Machine Chest Press & Fly Split',
    description: 'A fully guided, machine-only chest workout designed for safe progression and deep pectoral isolation.',
    muscleGroup: 'Chest',
    exercises: [
      {
        id: 'mc1_ex1',
        exerciseId: 'chest_press_machine',
        name: 'Chest Press Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'chest_press_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 35, isCompleted: false },
          { setId: 2, reps: 10, weight: 40, isCompleted: false },
          { setId: 3, reps: 8, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'mc1_ex2',
        exerciseId: 'pec_dec_fly_machine',
        name: 'Pec Dec Fly Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'pec_dec_fly_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 25, isCompleted: false },
          { setId: 2, reps: 12, weight: 30, isCompleted: false },
          { setId: 3, reps: 10, weight: 35, isCompleted: false }
        ]
      },
      {
        id: 'mc1_ex3',
        exerciseId: 'incline_chest_press_machine',
        name: 'Incline Machine Chest Press',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'incline_chest_press_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 30, isCompleted: false },
          { setId: 2, reps: 10, weight: 35, isCompleted: false },
          { setId: 3, reps: 8, weight: 40, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_chest_2',
    name: 'Smith Machine Pec Developer',
    description: 'Focuses on heavy pressing stability using the Smith Machine at flat and incline angles paired with cable crossovers.',
    muscleGroup: 'Chest',
    exercises: [
      {
        id: 'mc2_ex1',
        exerciseId: 'smith_machine_flat_press',
        name: 'Smith Machine Flat Press',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'smith_machine_flat_press')!.instructions,
        restDuration: 90,
        sets: [
          { setId: 1, reps: 10, weight: 60, isCompleted: false },
          { setId: 2, reps: 8, weight: 70, isCompleted: false },
          { setId: 3, reps: 6, weight: 80, isCompleted: false }
        ]
      },
      {
        id: 'mc2_ex2',
        exerciseId: 'cable_crossover_machine',
        name: 'Cable Crossover Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_crossover_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 20, isCompleted: false },
          { setId: 3, reps: 10, weight: 25, isCompleted: false }
        ]
      },
      {
        id: 'mc2_ex3',
        exerciseId: 'incline_chest_press_machine',
        name: 'Incline Machine Chest Press',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'incline_chest_press_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 30, isCompleted: false },
          { setId: 2, reps: 10, weight: 35, isCompleted: false },
          { setId: 3, reps: 8, weight: 40, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_chest_3',
    name: 'Cable Only Chest Sculpt',
    description: 'Leverage continuous cable tension from low, middle, and high angles to fully define the pectorals.',
    muscleGroup: 'Chest',
    exercises: [
      {
        id: 'mc3_ex1',
        exerciseId: 'cable_crossover_machine',
        name: 'Cable Crossover Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_crossover_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 15, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 20, isCompleted: false },
          { setId: 3, reps: 12, weight: 20, isCompleted: false }
        ]
      },
      {
        id: 'mc3_ex2',
        exerciseId: 'pec_dec_fly_machine',
        name: 'Pec Dec Fly Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'pec_dec_fly_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 25, isCompleted: false },
          { setId: 2, reps: 12, weight: 30, isCompleted: false },
          { setId: 3, reps: 10, weight: 35, isCompleted: false }
        ]
      },
      {
        id: 'mc3_ex3',
        exerciseId: 'chest_press_machine',
        name: 'Chest Press Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'chest_press_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 35, isCompleted: false },
          { setId: 2, reps: 10, weight: 40, isCompleted: false },
          { setId: 3, reps: 8, weight: 45, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_chest_4',
    name: 'Heavy Machine Pressing Volume',
    description: 'Maximizes mechanical advantage for heavy lifting across diverse chest machine configurations.',
    muscleGroup: 'Chest',
    exercises: [
      {
        id: 'mc4_ex1',
        exerciseId: 'chest_press_machine',
        name: 'Chest Press Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'chest_press_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 40, isCompleted: false },
          { setId: 2, reps: 10, weight: 50, isCompleted: false },
          { setId: 3, reps: 8, weight: 60, isCompleted: false }
        ]
      },
      {
        id: 'mc4_ex2',
        exerciseId: 'decline_press_machine',
        name: 'Decline Press Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'decline_press_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 35, isCompleted: false },
          { setId: 2, reps: 10, weight: 40, isCompleted: false },
          { setId: 3, reps: 8, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'mc4_ex3',
        exerciseId: 'pec_dec_fly_machine',
        name: 'Pec Dec Fly Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'pec_dec_fly_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 30, isCompleted: false },
          { setId: 2, reps: 10, weight: 35, isCompleted: false },
          { setId: 3, reps: 10, weight: 35, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_chest_5',
    name: 'Incline Machine Peak Builder',
    description: 'High-intensity upper chest focus using specialized plate-loaded chest machines and incline cable flyes.',
    muscleGroup: 'Chest',
    exercises: [
      {
        id: 'mc5_ex1',
        exerciseId: 'incline_chest_press_machine',
        name: 'Incline Machine Chest Press',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'incline_chest_press_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 30, isCompleted: false },
          { setId: 2, reps: 10, weight: 35, isCompleted: false },
          { setId: 3, reps: 8, weight: 40, isCompleted: false },
          { setId: 4, reps: 6, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'mc5_ex2',
        exerciseId: 'pec_dec_fly_machine',
        name: 'Pec Dec Fly Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'pec_dec_fly_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 25, isCompleted: false },
          { setId: 2, reps: 12, weight: 30, isCompleted: false },
          { setId: 3, reps: 10, weight: 35, isCompleted: false }
        ]
      },
      {
        id: 'mc5_ex3',
        exerciseId: 'cable_crossover_machine',
        name: 'Cable Crossover Machine',
        muscleGroup: 'Chest',
        type: 'reps',
        image: CHEST_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_crossover_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 15, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'back_day',
    name: 'Shoulder and Back Workout',
    description: 'A powerful combination of vertical and horizontal pulls to expand lat width and build mid-back thickness.',
    muscleGroup: 'Back',
    exercises: [
      {
        id: 'bd_1',
        exerciseId: 'pullups',
        name: 'Deadhang Pull-Ups',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'pullups')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 8, weight: 0, isCompleted: false },
          { setId: 2, reps: 8, weight: 0, isCompleted: false },
          { setId: 3, reps: 6, weight: 0, isCompleted: false }
        ]
      },
      {
        id: 'bd_2',
        exerciseId: 'lat_pulldowns',
        name: 'Seated Lat Pulldown',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'lat_pulldowns')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 45, isCompleted: false },
          { setId: 2, reps: 10, weight: 45, isCompleted: false },
          { setId: 3, reps: 10, weight: 50, isCompleted: false },
          { setId: 4, reps: 8, weight: 55, isCompleted: false }
        ]
      },
      {
        id: 'bd_3',
        exerciseId: 'db_rows',
        name: 'One-Arm Dumbbell Rows',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'db_rows')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 18, isCompleted: false },
          { setId: 2, reps: 12, weight: 18, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false }
        ]
      }
    ]
  },
  // BACK MACHINE ROUTINES
  {
    id: 'machine_back_1',
    name: 'Full Back Machine Pull Split',
    description: 'Complete machine-guided pulling sequence covering high row, vertical pulldowns, and mid-row thickness.',
    muscleGroup: 'Back',
    exercises: [
      {
        id: 'mb1_ex1',
        exerciseId: 'lat_pulldowns',
        name: 'Seated Lat Pulldown',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'lat_pulldowns')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 40, isCompleted: false },
          { setId: 2, reps: 10, weight: 45, isCompleted: false },
          { setId: 3, reps: 10, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'mb1_ex2',
        exerciseId: 'seated_cable_row',
        name: 'Seated Cable Row',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'seated_cable_row')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 35, isCompleted: false },
          { setId: 2, reps: 10, weight: 40, isCompleted: false },
          { setId: 3, reps: 10, weight: 40, isCompleted: false }
        ]
      },
      {
        id: 'mb1_ex3',
        exerciseId: 'leverage_high_row',
        name: 'Leverage High Row Machine',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leverage_high_row')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 30, isCompleted: false },
          { setId: 2, reps: 10, weight: 35, isCompleted: false },
          { setId: 3, reps: 8, weight: 40, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_back_2',
    name: 'Lat Pulldown & Cable Row Master',
    description: 'A high-volume cable-focused routine targeting back width and density through diverse attachments and grip widths.',
    muscleGroup: 'Back',
    exercises: [
      {
        id: 'mb2_ex1',
        exerciseId: 'lat_pulldowns',
        name: 'Seated Lat Pulldown',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'lat_pulldowns')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 40, isCompleted: false },
          { setId: 2, reps: 10, weight: 45, isCompleted: false },
          { setId: 3, reps: 8, weight: 50, isCompleted: false }
        ]
      },
      {
        id: 'mb2_ex2',
        exerciseId: 'seated_cable_row',
        name: 'Seated Cable Row',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'seated_cable_row')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 35, isCompleted: false },
          { setId: 2, reps: 10, weight: 40, isCompleted: false },
          { setId: 3, reps: 10, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'mb2_ex3',
        exerciseId: 'close_grip_lat_pulldown_machine',
        name: 'Close Grip Lat Pulldown',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'close_grip_lat_pulldown_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 40, isCompleted: false },
          { setId: 2, reps: 10, weight: 45, isCompleted: false },
          { setId: 3, reps: 10, weight: 45, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_back_3',
    name: 'Machine T-Bar & Row Power',
    description: 'Built around heavy machine rows and rear delt isolations for structural upper back thickness.',
    muscleGroup: 'Back',
    exercises: [
      {
        id: 'mb3_ex1',
        exerciseId: 't_bar_row_machine',
        name: 'T-Bar Row Machine',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 't_bar_row_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 30, isCompleted: false },
          { setId: 2, reps: 10, weight: 35, isCompleted: false },
          { setId: 3, reps: 8, weight: 40, isCompleted: false }
        ]
      },
      {
        id: 'mb3_ex2',
        exerciseId: 'seated_cable_row',
        name: 'Seated Cable Row',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'seated_cable_row')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 40, isCompleted: false },
          { setId: 2, reps: 10, weight: 45, isCompleted: false },
          { setId: 3, reps: 8, weight: 50, isCompleted: false }
        ]
      },
      {
        id: 'mb3_ex3',
        exerciseId: 'reverse_pec_dec_machine',
        name: 'Reverse Pec Dec Machine',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'reverse_pec_dec_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 15, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_back_4',
    name: 'Assisted Pull-Up & Lat Expansion',
    description: 'Perfect for building vertical pulling volume using counter-balance assistance and wide machine pulls.',
    muscleGroup: 'Back',
    exercises: [
      {
        id: 'mb4_ex1',
        exerciseId: 'assisted_pullup_machine',
        name: 'Machine Assisted Pull-Up',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'assisted_pullup_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 35, isCompleted: false },
          { setId: 2, reps: 10, weight: 30, isCompleted: false },
          { setId: 3, reps: 8, weight: 25, isCompleted: false }
        ]
      },
      {
        id: 'mb4_ex2',
        exerciseId: 'lat_pulldowns',
        name: 'Seated Lat Pulldown',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'lat_pulldowns')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 40, isCompleted: false },
          { setId: 2, reps: 10, weight: 45, isCompleted: false },
          { setId: 3, reps: 10, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'mb4_ex3',
        exerciseId: 'seated_cable_row',
        name: 'Seated Cable Row',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'seated_cable_row')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 35, isCompleted: false },
          { setId: 2, reps: 10, weight: 40, isCompleted: false },
          { setId: 3, reps: 10, weight: 40, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_back_5',
    name: 'Cable Pullover & High Row Width',
    description: 'An elite muscle-isolation routine utilizing continuous cable tension and chest-supported high row leverages.',
    muscleGroup: 'Back',
    exercises: [
      {
        id: 'mb5_ex1',
        exerciseId: 'leverage_high_row',
        name: 'Leverage High Row Machine',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leverage_high_row')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 30, isCompleted: false },
          { setId: 2, reps: 10, weight: 35, isCompleted: false },
          { setId: 3, reps: 8, weight: 40, isCompleted: false }
        ]
      },
      {
        id: 'mb5_ex2',
        exerciseId: 'cable_straight_arm_pulldown',
        name: 'Cable Straight-Arm Pulldown',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_straight_arm_pulldown')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 20, isCompleted: false },
          { setId: 2, reps: 12, weight: 20, isCompleted: false },
          { setId: 3, reps: 10, weight: 25, isCompleted: false }
        ]
      },
      {
        id: 'mb5_ex3',
        exerciseId: 'reverse_pec_dec_machine',
        name: 'Reverse Pec Dec Machine',
        muscleGroup: 'Back',
        type: 'reps',
        image: BACK_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'reverse_pec_dec_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 15, isCompleted: false },
          { setId: 3, reps: 12, weight: 15, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'legs_day',
    name: 'Quad and Glute Workout',
    description: 'High-tension lower-body routine designed to strengthen the legs, hips, and dynamic stabilization.',
    muscleGroup: 'Legs',
    exercises: [
      {
        id: 'ld_1',
        exerciseId: 'goblet_squats',
        name: 'Dumbbell Goblet Squats',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'goblet_squats')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 22, isCompleted: false },
          { setId: 2, reps: 10, weight: 22, isCompleted: false },
          { setId: 3, reps: 10, weight: 24, isCompleted: false },
          { setId: 4, reps: 8, weight: 26, isCompleted: false }
        ]
      },
      {
        id: 'ld_2',
        exerciseId: 'lunges',
        name: 'Walking Lunges',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'lunges')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 10, isCompleted: false },
          { setId: 2, reps: 10, weight: 10, isCompleted: false },
          { setId: 3, reps: 10, weight: 10, isCompleted: false }
        ]
      },
      {
        id: 'ld_3',
        exerciseId: 'squats',
        name: 'Bodyweight Squats',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'squats')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 15, weight: 0, isCompleted: false },
          { setId: 2, reps: 15, weight: 0, isCompleted: false },
          { setId: 3, reps: 15, weight: 0, isCompleted: false }
        ]
      }
    ]
  },
  // LEGS MACHINE ROUTINES
  {
    id: 'machine_legs_1',
    name: 'Leg Press & Extension Volume',
    description: 'Machine-based lower body routine focusing on quad isolation and heavy, joint-friendly leg press sets.',
    muscleGroup: 'Legs',
    exercises: [
      {
        id: 'ml1_ex1',
        exerciseId: 'leg_press',
        name: 'Leg Press Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leg_press')!.instructions,
        restDuration: 90,
        sets: [
          { setId: 1, reps: 12, weight: 140, isCompleted: false },
          { setId: 2, reps: 10, weight: 160, isCompleted: false },
          { setId: 3, reps: 10, weight: 180, isCompleted: false }
        ]
      },
      {
        id: 'ml1_ex2',
        exerciseId: 'leg_extensions',
        name: 'Leg Extension Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leg_extensions')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 35, isCompleted: false },
          { setId: 2, reps: 12, weight: 40, isCompleted: false },
          { setId: 3, reps: 10, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'ml1_ex3',
        exerciseId: 'leg_curls',
        name: 'Leg Curl Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leg_curls')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 30, isCompleted: false },
          { setId: 2, reps: 12, weight: 30, isCompleted: false },
          { setId: 3, reps: 10, weight: 35, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_legs_2',
    name: 'Smith Machine Quad & Glute Builder',
    description: 'Heavy guided squats and calf developments using the safe vertical track of the Smith Machine.',
    muscleGroup: 'Legs',
    exercises: [
      {
        id: 'ml2_ex1',
        exerciseId: 'smith_machine_squat',
        name: 'Smith Machine Squat',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'smith_machine_squat')!.instructions,
        restDuration: 90,
        sets: [
          { setId: 1, reps: 10, weight: 60, isCompleted: false },
          { setId: 2, reps: 8, weight: 70, isCompleted: false },
          { setId: 3, reps: 8, weight: 80, isCompleted: false }
        ]
      },
      {
        id: 'ml2_ex2',
        exerciseId: 'leg_press',
        name: 'Leg Press Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leg_press')!.instructions,
        restDuration: 90,
        sets: [
          { setId: 1, reps: 10, weight: 150, isCompleted: false },
          { setId: 2, reps: 10, weight: 170, isCompleted: false },
          { setId: 3, reps: 8, weight: 190, isCompleted: false }
        ]
      },
      {
        id: 'ml2_ex3',
        exerciseId: 'standing_calf_raise_machine',
        name: 'Standing Calf Raise Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'standing_calf_raise_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 15, weight: 30, isCompleted: false },
          { setId: 2, reps: 15, weight: 35, isCompleted: false },
          { setId: 3, reps: 15, weight: 40, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_legs_3',
    name: 'Hamstring & Glute Machine Focus',
    description: 'Specifically target the posterior chain using specialized leg curl configurations and abduction machines.',
    muscleGroup: 'Legs',
    exercises: [
      {
        id: 'ml3_ex1',
        exerciseId: 'lying_leg_curl_machine',
        name: 'Lying Leg Curl Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'lying_leg_curl_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 25, isCompleted: false },
          { setId: 2, reps: 12, weight: 30, isCompleted: false },
          { setId: 3, reps: 10, weight: 35, isCompleted: false }
        ]
      },
      {
        id: 'ml3_ex2',
        exerciseId: 'leg_curls',
        name: 'Leg Curl Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leg_curls')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 30, isCompleted: false },
          { setId: 2, reps: 12, weight: 30, isCompleted: false },
          { setId: 3, reps: 12, weight: 35, isCompleted: false }
        ]
      },
      {
        id: 'ml3_ex3',
        exerciseId: 'hip_abduction_machine',
        name: 'Hip Abduction Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'hip_abduction_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 15, weight: 25, isCompleted: false },
          { setId: 2, reps: 15, weight: 30, isCompleted: false },
          { setId: 3, reps: 15, weight: 30, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_legs_4',
    name: 'Hack Squat & Leg Extension Power',
    description: 'A high-intensity quadriceps builder utilizing the hack squat machine and extension sets.',
    muscleGroup: 'Legs',
    exercises: [
      {
        id: 'ml4_ex1',
        exerciseId: 'hack_squat_machine',
        name: 'Hack Squat Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'hack_squat_machine')!.instructions,
        restDuration: 90,
        sets: [
          { setId: 1, reps: 10, weight: 60, isCompleted: false },
          { setId: 2, reps: 8, weight: 80, isCompleted: false },
          { setId: 3, reps: 8, weight: 90, isCompleted: false }
        ]
      },
      {
        id: 'ml4_ex2',
        exerciseId: 'leg_extensions',
        name: 'Leg Extension Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leg_extensions')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 35, isCompleted: false },
          { setId: 2, reps: 10, weight: 45, isCompleted: false },
          { setId: 3, reps: 10, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'ml4_ex3',
        exerciseId: 'seated_calf_raises',
        name: 'Seated Calf Raises',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'seated_calf_raises')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 15, weight: 20, isCompleted: false },
          { setId: 2, reps: 15, weight: 25, isCompleted: false },
          { setId: 3, reps: 15, weight: 25, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_legs_5',
    name: 'Calf & Hip Machine Sculpt',
    description: 'Isolate hip stability, adductors, and lower leg calves through dedicated machine movements.',
    muscleGroup: 'Legs',
    exercises: [
      {
        id: 'ml5_ex1',
        exerciseId: 'seated_calf_raises',
        name: 'Seated Calf Raises',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'seated_calf_raises')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 15, weight: 20, isCompleted: false },
          { setId: 2, reps: 15, weight: 25, isCompleted: false },
          { setId: 3, reps: 15, weight: 25, isCompleted: false }
        ]
      },
      {
        id: 'ml5_ex2',
        exerciseId: 'standing_calf_raise_machine',
        name: 'Standing Calf Raise Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'standing_calf_raise_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 15, weight: 35, isCompleted: false },
          { setId: 2, reps: 15, weight: 40, isCompleted: false },
          { setId: 3, reps: 15, weight: 45, isCompleted: false }
        ]
      },
      {
        id: 'ml5_ex3',
        exerciseId: 'hip_adduction_machine',
        name: 'Hip Adduction Machine',
        muscleGroup: 'Legs',
        type: 'reps',
        image: LEGS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'hip_adduction_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 15, weight: 25, isCompleted: false },
          { setId: 2, reps: 15, weight: 30, isCompleted: false },
          { setId: 3, reps: 15, weight: 30, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'core_steel',
    name: 'Core Workout',
    description: 'An isometric and dynamic abdominal challenge to strengthen deep stabilizers and obliques.',
    muscleGroup: 'Core',
    exercises: [
      {
        id: 'cs_1',
        exerciseId: 'plank',
        name: 'Isometric Forearm Plank',
        muscleGroup: 'Core',
        type: 'time',
        defaultDuration: 60,
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'plank')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, duration: 60, isCompleted: false },
          { setId: 2, duration: 45, isCompleted: false },
          { setId: 3, duration: 45, isCompleted: false }
        ]
      },
      {
        id: 'cs_2',
        exerciseId: 'leg_raises',
        name: 'Lying Leg Raises',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'leg_raises')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 0, isCompleted: false },
          { setId: 2, reps: 12, weight: 0, isCompleted: false },
          { setId: 3, reps: 10, weight: 0, isCompleted: false }
        ]
      }
    ]
  },
  // CORE MACHINE ROUTINES
  {
    id: 'machine_core_1',
    name: 'Ab Crunch & Woodchop Machine Circuit',
    description: 'Complete abdominal rotation and flexion workout using heavy cable stacks and rotary machines.',
    muscleGroup: 'Core',
    exercises: [
      {
        id: 'mco1_ex1',
        exerciseId: 'cable_woodchop',
        name: 'Cable Woodchop',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_woodchop')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 15, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false }
        ]
      },
      {
        id: 'mco1_ex2',
        exerciseId: 'ab_crunch_machine',
        name: 'Abdominal Crunch Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'ab_crunch_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 12, weight: 20, isCompleted: false },
          { setId: 2, reps: 12, weight: 25, isCompleted: false },
          { setId: 3, reps: 10, weight: 30, isCompleted: false }
        ]
      },
      {
        id: 'mco1_ex3',
        exerciseId: 'cable_ab_crunch',
        name: 'Cable Abdominal Crunch',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_ab_crunch')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 15, weight: 25, isCompleted: false },
          { setId: 2, reps: 15, weight: 30, isCompleted: false },
          { setId: 3, reps: 12, weight: 35, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_core_2',
    name: 'Cable Ab Crunch & Oblique Sculpt',
    description: 'High-tension continuous resistance targeting the rectus abdominis and obliques.',
    muscleGroup: 'Core',
    exercises: [
      {
        id: 'mco2_ex1',
        exerciseId: 'cable_ab_crunch',
        name: 'Cable Abdominal Crunch',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_ab_crunch')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 15, weight: 30, isCompleted: false },
          { setId: 2, reps: 12, weight: 35, isCompleted: false },
          { setId: 3, reps: 12, weight: 35, isCompleted: false }
        ]
      },
      {
        id: 'mco2_ex2',
        exerciseId: 'cable_woodchop',
        name: 'Cable Woodchop',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_woodchop')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 15, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false }
        ]
      },
      {
        id: 'mco2_ex3',
        exerciseId: 'rotary_torso_machine',
        name: 'Rotary Torso Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'rotary_torso_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 20, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_core_3',
    name: 'Captain\'s Chair Abdominal Power',
    description: 'Focuses on leg raises and structural trunk stabilizer machines for deep core strength.',
    muscleGroup: 'Core',
    exercises: [
      {
        id: 'mco3_ex1',
        exerciseId: 'captains_chair_machine',
        name: 'Captain\'s Chair Leg Raise Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'captains_chair_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 0, isCompleted: false },
          { setId: 2, reps: 10, weight: 0, isCompleted: false },
          { setId: 3, reps: 8, weight: 0, isCompleted: false }
        ]
      },
      {
        id: 'mco3_ex2',
        exerciseId: 'ab_crunch_machine',
        name: 'Abdominal Crunch Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'ab_crunch_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 12, weight: 20, isCompleted: false },
          { setId: 2, reps: 12, weight: 25, isCompleted: false },
          { setId: 3, reps: 10, weight: 25, isCompleted: false }
        ]
      },
      {
        id: 'mco3_ex3',
        exerciseId: 'rotary_torso_machine',
        name: 'Rotary Torso Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'rotary_torso_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 15, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_core_4',
    name: 'Rotary Torso & Crunch Burner',
    description: 'Designed to build rotational core power and waist stabilization using high-precision rotary machines.',
    muscleGroup: 'Core',
    exercises: [
      {
        id: 'mco4_ex1',
        exerciseId: 'rotary_torso_machine',
        name: 'Rotary Torso Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'rotary_torso_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 20, isCompleted: false },
          { setId: 3, reps: 10, weight: 25, isCompleted: false }
        ]
      },
      {
        id: 'mco4_ex2',
        exerciseId: 'ab_crunch_machine',
        name: 'Abdominal Crunch Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'ab_crunch_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 12, weight: 20, isCompleted: false },
          { setId: 2, reps: 12, weight: 25, isCompleted: false },
          { setId: 3, reps: 10, weight: 30, isCompleted: false }
        ]
      },
      {
        id: 'mco4_ex3',
        exerciseId: 'cable_ab_crunch',
        name: 'Cable Abdominal Crunch',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_ab_crunch')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 15, weight: 25, isCompleted: false },
          { setId: 2, reps: 15, weight: 30, isCompleted: false },
          { setId: 3, reps: 12, weight: 35, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'machine_core_5',
    name: 'Heavy Cable Oblique Carver',
    description: 'Intensive core rotation and brace routine utilizing woodchops and standing stabilizer stacks.',
    muscleGroup: 'Core',
    exercises: [
      {
        id: 'mco5_ex1',
        exerciseId: 'cable_woodchop',
        name: 'Cable Woodchop',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'cable_woodchop')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 20, isCompleted: false },
          { setId: 3, reps: 10, weight: 25, isCompleted: false }
        ]
      },
      {
        id: 'mco5_ex2',
        exerciseId: 'rotary_torso_machine',
        name: 'Rotary Torso Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'rotary_torso_machine')!.instructions,
        restDuration: 45,
        sets: [
          { setId: 1, reps: 12, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 20, isCompleted: false },
          { setId: 3, reps: 10, weight: 20, isCompleted: false }
        ]
      },
      {
        id: 'mco5_ex3',
        exerciseId: 'captains_chair_machine',
        name: 'Captain\'s Chair Leg Raise Machine',
        muscleGroup: 'Core',
        type: 'reps',
        image: CORE_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'captains_chair_machine')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 0, isCompleted: false },
          { setId: 2, reps: 10, weight: 0, isCompleted: false },
          { setId: 3, reps: 10, weight: 0, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'arms_loki_hypertrophy',
    name: 'Loki\'s Arm Hypertrophy',
    description: 'A comprehensive bicep and tricep pumping routine designed by the Trickster God to forge legendary peak shape and size.',
    muscleGroup: 'Arms',
    exercises: [
      {
        id: 'alh_ex1',
        exerciseId: 'barbell_bicep_curl',
        name: 'Barbell Bicep Curl',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'barbell_bicep_curl')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 20, isCompleted: false },
          { setId: 2, reps: 10, weight: 25, isCompleted: false },
          { setId: 3, reps: 10, weight: 25, isCompleted: false },
          { setId: 4, reps: 8, weight: 30, isCompleted: false }
        ]
      },
      {
        id: 'alh_ex2',
        exerciseId: 'tricep_pushdowns',
        name: 'Triceps Cable Pushdown',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'tricep_pushdowns')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 15, weight: 15, isCompleted: false },
          { setId: 2, reps: 12, weight: 20, isCompleted: false },
          { setId: 3, reps: 12, weight: 20, isCompleted: false },
          { setId: 4, reps: 10, weight: 25, isCompleted: false }
        ]
      },
      {
        id: 'alh_ex3',
        exerciseId: 'dumbbell_hammer_curl',
        name: 'Dumbbell Hammer Curl',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'dumbbell_hammer_curl')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 12, isCompleted: false },
          { setId: 2, reps: 10, weight: 14, isCompleted: false },
          { setId: 3, reps: 10, weight: 14, isCompleted: false }
        ]
      },
      {
        id: 'alh_ex4',
        exerciseId: 'db_overhead_tricep_ext',
        name: 'Overhead Dumbbell Tricep Extension',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'db_overhead_tricep_ext')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 16, isCompleted: false },
          { setId: 2, reps: 10, weight: 18, isCompleted: false },
          { setId: 3, reps: 10, weight: 18, isCompleted: false }
        ]
      },
      {
        id: 'alh_ex5',
        exerciseId: 'preacher_curl',
        name: 'Preacher Bicep Curl',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'preacher_curl')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 15, isCompleted: false },
          { setId: 2, reps: 10, weight: 15, isCompleted: false },
          { setId: 3, reps: 8, weight: 20, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'arms_viking_desolation',
    name: 'Viking Arm Desolation',
    description: 'A relentless bodyweight and isolation routine focused on forcing maximum blood flow and endurance into the triceps and biceps.',
    muscleGroup: 'Arms',
    exercises: [
      {
        id: 'avd_ex1',
        exerciseId: 'bench_dips',
        name: 'Bench Dips',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'bench_dips')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 15, weight: 0, isCompleted: false },
          { setId: 2, reps: 15, weight: 0, isCompleted: false },
          { setId: 3, reps: 12, weight: 0, isCompleted: false },
          { setId: 4, reps: 12, weight: 0, isCompleted: false }
        ]
      },
      {
        id: 'avd_ex2',
        exerciseId: 'concentration_curl',
        name: 'Concentration Curl',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'concentration_curl')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 10, isCompleted: false },
          { setId: 2, reps: 10, weight: 12, isCompleted: false },
          { setId: 3, reps: 10, weight: 12, isCompleted: false }
        ]
      },
      {
        id: 'avd_ex3',
        exerciseId: 'db_overhead_tricep_ext',
        name: 'Overhead Dumbbell Tricep Extension',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'db_overhead_tricep_ext')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 12, weight: 14, isCompleted: false },
          { setId: 2, reps: 12, weight: 14, isCompleted: false },
          { setId: 3, reps: 10, weight: 16, isCompleted: false }
        ]
      },
      {
        id: 'avd_ex4',
        exerciseId: 'dumbbell_hammer_curl',
        name: 'Dumbbell Hammer Curl',
        muscleGroup: 'Arms',
        type: 'reps',
        image: ARMS_IMAGE,
        instructions: INITIAL_EXERCISES.find(e => e.id === 'dumbbell_hammer_curl')!.instructions,
        restDuration: 60,
        sets: [
          { setId: 1, reps: 10, weight: 12, isCompleted: false },
          { setId: 2, reps: 10, weight: 12, isCompleted: false },
          { setId: 3, reps: 8, weight: 14, isCompleted: false }
        ]
      }
    ]
  },
  {
    id: 'cardio_preset_walking',
    name: 'Cardio: Walking',
    description: 'Track walking routes, pace, elevation, and distance using GPS tracking or countdown timers.',
    muscleGroup: 'Cardio',
    exercises: []
  },
  {
    id: 'cardio_preset_running',
    name: 'Cardio: Running',
    description: 'Run tracking with real-time speed, average pace calculation, live GPS path overlays, and altimeter.',
    muscleGroup: 'Cardio',
    exercises: []
  },
  {
    id: 'cardio_preset_sprinting',
    name: 'Cardio: Sprinting',
    description: 'High-intensity sprinting tracker with lap stopwatches and distance markers.',
    muscleGroup: 'Cardio',
    exercises: []
  },
  {
    id: 'cardio_preset_cycling',
    name: 'Cardio: Cycling',
    description: 'Cycle training session logging routes, elevation profiles, and top speeds.',
    muscleGroup: 'Cardio',
    exercises: []
  },
  {
    id: 'cardio_preset_paddleboarding',
    name: 'Cardio: Paddleboarding',
    description: 'Outdoor paddle session tracking core stability, coordinates, and duration.',
    muscleGroup: 'Cardio',
    exercises: []
  }
];
