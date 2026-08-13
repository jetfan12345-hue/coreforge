export type Equipment =
  | "bodyweight"
  | "barbell"
  | "plate"
  | "cable"
  | "pull-up bar"
  | "ab wheel"
  | "dumbbell"
  | "band"
  | "bench";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type MuscleFocus =
  | "upper abs"
  | "lower abs"
  | "obliques"
  | "transverse"
  | "full core"
  | "hip flexors"
  | "posterior"
  | "full body";

export type UnitMode = "reps" | "hold" | "time";

export type ExerciseRole = "warmup" | "work" | "cooldown";

/** Demo coach shown in exercise media */
export type DemoModel = "female" | "male";

export interface Exercise {
  id: string;
  name: string;
  shortName: string;
  description: string;
  howTo: string[];
  tips: string[];
  equipment: Equipment[];
  difficulty: Difficulty;
  focus: MuscleFocus[];
  met: number;
  unit: UnitMode;
  defaultSets: number;
  defaultReps: number;
  defaultSeconds: number;
  restSeconds: number;
  weighted: boolean;
  popularRank: number;
  image: string;
  video?: string;
  cues: string[];
  role?: ExerciseRole;
}

const V = 21;

function media(id: string) {
  return {
    image: `/exercises/${id}.jpg?v=${V}`,
    video: `/exercises/${id}.mp4?v=${V}`,
  };
}

/** Resolve media paths for the selected demo model (male falls back to female on 404 in UI). */
export function resolveExerciseMedia(
  exercise: Pick<Exercise, "id" | "image" | "video">,
  model: DemoModel = "female",
): { image: string; video?: string; femaleImage: string; femaleVideo?: string } {
  if (model === "male") {
    return {
      image: `/exercises/male/${exercise.id}.jpg?v=${V}`,
      video: `/exercises/male/${exercise.id}.mp4?v=${V}`,
      femaleImage: exercise.image,
      femaleVideo: exercise.video,
    };
  }
  return {
    image: exercise.image,
    video: exercise.video,
    femaleImage: exercise.image,
    femaleVideo: exercise.video,
  };
}

export function heroImage(model: DemoModel = "female"): string {
  return model === "male"
    ? `/exercises/male/hero.jpg?v=${V}`
    : `/exercises/hero.jpg?v=${V}`;
}

/**
 * Core library — bodyweight-first with optional gear overload.
 * Circuit sessions: warmup → work × rounds → cooldown.
 * Female demos live under /exercises/; male under /exercises/male/.
 */

export const exercises: Exercise[] = [
	{
		id: "jumping-jacks",
		name: "Jumping Jacks",
		shortName: "Jacks",
		description: "Full-body warm-up classic — raises heart rate and loosens hips and shoulders before floor work.",
		howTo: [
			"Stand tall, feet together, arms at sides.",
			"Jump feet out wide while raising arms overhead.",
			"Jump feet back together while lowering arms.",
			"Keep a steady rhythm; soft landings."
		],
		tips: [
			"Land soft — knees soft, not locked.",
			"Arms reach long overhead, not behind the neck.",
			"Breathe steadily; this is a warm-up, not a sprint."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["full body"],
		met: 8,
		unit: "time",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 40,
		restSeconds: 10,
		weighted: false,
		popularRank: 100,
		role: "warmup",
		...media("jumping-jacks"),
		cues: [
			"Feet out",
			"Arms up",
			"Feet in",
			"Steady pace"
		]
	},
	{
		id: "mountain-climber",
		name: "Mountain Climber",
		shortName: "Climbers",
		description: "High-plank warm-up — alternating knees drive toward the chest to heat the core and hips.",
		howTo: [
			"Start in a strong high plank, hands under shoulders, body in a straight line.",
			"Drive right knee toward the chest, then quickly switch legs.",
			"Keep hips level — no bouncing or piking.",
			"Continue alternating at a controlled warm-up pace."
		],
		tips: [
			"Hands stay planted under shoulders.",
			"Hips quiet and level — think running, not hopping.",
			"This is the forward climber, not a cross-body twist."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: [
			"full core",
			"hip flexors",
			"full body"
		],
		met: 8,
		unit: "time",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 40,
		restSeconds: 10,
		weighted: false,
		popularRank: 101,
		role: "warmup",
		...media("mountain-climber"),
		cues: [
			"High plank",
			"Knee in",
			"Switch",
			"Hips level"
		]
	},
	{
		id: "bicycle-crunch",
		name: "Bicycle Crunch",
		shortName: "Bicycle",
		description: "Top-tier ab builder that hits rectus abdominis and obliques with continuous rotation and flexion.",
		howTo: [
			"Lie on your back, hands lightly behind your head, knees bent.",
			"Lift shoulders off the floor and bring right elbow toward left knee while extending the right leg.",
			"Switch sides in a smooth pedaling motion without yanking the neck.",
			"Keep lower back pressed into the floor throughout."
		],
		tips: [
			"Hands light behind head — never yank the neck.",
			"Rotate from the ribs; elbow meets opposite knee slowly.",
			"Keep low back glued to the floor the whole set."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: [
			"upper abs",
			"obliques",
			"full core"
		],
		met: 4,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 20,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 1,
		...media("bicycle-crunch"),
		cues: [
			"Elbow to opposite knee",
			"Extend long",
			"Switch sides",
			"Core tight"
		]
	},
	{
		id: "plank",
		name: "Front Plank",
		shortName: "Plank",
		description: "Isometric staple for deep core stability — transverse abdominis, rectus, and shoulders.",
		howTo: [
			"Place forearms on the floor, elbows under shoulders.",
			"Extend legs, squeeze glutes, and form a straight line head to heels.",
			"Brace as if expecting a punch; do not sag or pike.",
			"Breathe steadily while holding."
		],
		tips: [
			"Stack elbows under shoulders; forearms press the floor away.",
			"Squeeze glutes and keep hips level — no sag, no pike.",
			"Neutral neck: gaze at the floor a few inches ahead of hands."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["transverse", "full core"],
		met: 3.8,
		unit: "hold",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 40,
		restSeconds: 12,
		weighted: false,
		popularRank: 2,
		...media("plank"),
		cues: [
			"Elbows under shoulders",
			"Ribs down",
			"Glutes on",
			"Hold steady"
		]
	},
	{
		id: "hanging-leg-raise",
		name: "Hanging Leg Raise",
		shortName: "Hang Raise",
		description: "Gold-standard lower-ab and hip-flexor strength move using a pull-up bar.",
		howTo: [
			"Hang from a pull-up bar with a shoulder-width overhand grip.",
			"Brace core, then raise straight legs toward hip height or higher.",
			"Control the descent — no swinging.",
			"Stop short of full dead hang if you start to lose form."
		],
		tips: [
			"Dead-hang brace first — ribs down, no swing.",
			"Raise legs with control; stop when form breaks.",
			"Lower slowly for 2–3 seconds every rep."
		],
		equipment: ["pull-up bar"],
		difficulty: "advanced",
		focus: [
			"lower abs",
			"hip flexors",
			"full core"
		],
		met: 5.5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 10,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: false,
		popularRank: 3,
		...media("hanging-leg-raise"),
		cues: [
			"Dead hang brace",
			"Legs up",
			"Pause top",
			"Slow down"
		]
	},
	{
		id: "russian-twist",
		name: "Russian Twist",
		shortName: "R. Twist",
		description: "Rotational core classic that hammers the obliques. Add a plate when bodyweight gets easy.",
		howTo: [
			"Sit on your sit bones with knees bent; lean torso back ~45° with a long spine (not lying flat).",
			"Lift feet a few inches or keep heels light; clasp hands or hold a plate at chest height.",
			"Rotate the ribcage side to side — each side is a rep — while chest stays tall.",
			"Control the return through center; do not flop onto your back."
		],
		tips: [
			"This is a seated V-sit lean, not a crunch on the floor.",
			"Rotate the ribcage, not just the arms.",
			"Tap lightly each side; avoid bouncing momentum."
		],
		equipment: ["bodyweight", "plate"],
		difficulty: "beginner",
		focus: ["obliques", "full core"],
		met: 4.2,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 24,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 4,
		...media("russian-twist"),
		cues: [
			"Lean back",
			"Rotate right",
			"Rotate left",
			"Chest tall"
		]
	},
	{
		id: "cable-crunch",
		name: "Cable Crunch",
		shortName: "Cable",
		description: "Loaded spinal flexion on a high cable or lat pulldown stack — progressive overload for the rectus abdominis.",
		howTo: [
			"Kneel facing a high cable with a rope attachment at forehead height.",
			"Hold rope ends by your ears, hips locked over knees.",
			"Crunch down by curling ribs toward pelvis; hips stay still.",
			"Control the return without losing the brace."
		],
		tips: [
			"Knees fixed — curl ribs toward pelvis, not hips back.",
			"Rope by ears; keep elbows steady.",
			"Squeeze hard at the bottom before the return."
		],
		equipment: ["cable"],
		difficulty: "intermediate",
		focus: ["upper abs", "full core"],
		met: 5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: true,
		popularRank: 5,
		...media("cable-crunch"),
		cues: [
			"Rope by ears",
			"Ribs to hips",
			"Squeeze",
			"Slow return"
		]
	},
	{
		id: "ab-wheel-rollout",
		name: "Ab Wheel Rollout",
		shortName: "Ab Wheel",
		description: "Anti-extension core destroyer. Builds bulletproof midsection strength.",
		howTo: [
			"Kneel with ab wheel under shoulders, spine neutral.",
			"Brace hard, then roll forward until you feel max tension without sagging.",
			"Pull the wheel back by driving elbows down and crushing the abs.",
			"Keep hips from folding early on the return."
		],
		tips: [
			"Brace hard before the roll — never soft belly.",
			"Only go as far as you can without low-back sag.",
			"Pull back by driving elbows down through the abs."
		],
		equipment: ["ab wheel"],
		difficulty: "advanced",
		focus: ["transverse", "full core"],
		met: 5.8,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 8,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: false,
		popularRank: 6,
		...media("ab-wheel-rollout"),
		cues: [
			"Brace hard",
			"Roll out",
			"Hold edge",
			"Pull back"
		]
	},
	{
		id: "leg-raise",
		name: "Lying Leg Raise",
		shortName: "Leg Raise",
		description: "Floor staple for lower abs. Keep lumbar glued to the mat for clean reps.",
		howTo: [
			"Lie flat, hands under glutes or by sides for support.",
			"Raise straight legs to vertical (or as high as control allows).",
			"Lower slowly until heels nearly touch, then reverse.",
			"Press low back into the floor the entire set."
		],
		tips: [
			"Press low back into the floor before legs move.",
			"Lower until heels nearly hover, not slam.",
			"Slight knee bend is fine if hamstrings are tight."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["lower abs", "hip flexors"],
		met: 3.8,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 7,
		...media("leg-raise"),
		cues: [
			"Low back down",
			"Legs up",
			"Control down",
			"Repeat"
		]
	},
	{
		id: "barbell-rollout",
		name: "Barbell Rollout",
		shortName: "BB Rollout",
		description: "Ab-wheel progression using a loaded barbell with 25s or 45s for smooth rolling.",
		howTo: [
			"Load a barbell with plates (25s roll easiest; 45s for more challenge).",
			"Kneel, grip the bar shoulder-width, under shoulders.",
			"Roll the bar forward under full core brace until near lockout tension.",
			"Pull bar back by flexing the abs hard — keep spine neutral."
		],
		tips: [
			"Knees under hips, hands shoulder-width on the bar.",
			"Roll out only while spine stays neutral.",
			"Use 25s for smoother roll; progress to 45s when solid."
		],
		equipment: ["barbell", "plate"],
		difficulty: "advanced",
		focus: ["transverse", "full core"],
		met: 6,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 8,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: true,
		popularRank: 8,
		...media("barbell-rollout"),
		cues: [
			"Grip bar",
			"Roll out",
			"Brace harder",
			"Pull in"
		]
	},
	{
		id: "weighted-situp",
		name: "Weighted Sit-Up",
		shortName: "Wtd Sit-Up",
		description: "Classic sit-up overloaded with a 25 lb or 45 lb plate hugged to the chest.",
		howTo: [
			"Lie with knees bent, hold a plate tight against your chest.",
			"Sit up by curling the spine, keeping the plate pinned.",
			"Touch elbows toward thighs, then lower with control.",
			"Avoid yanking with the neck or bouncing off the floor."
		],
		tips: [
			"Pin the plate tight to your chest the whole rep.",
			"Curl vertebra by vertebra — don’t yank with hip flexors only.",
			"Control the descent; no bouncing off the floor."
		],
		equipment: ["plate", "bench"],
		difficulty: "intermediate",
		focus: ["upper abs", "full core"],
		met: 5.2,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: true,
		popularRank: 9,
		...media("weighted-situp"),
		cues: [
			"Plate to chest",
			"Curl up",
			"Squeeze top",
			"Lower slow"
		]
	},
	{
		id: "side-plank",
		name: "Side Plank",
		shortName: "Side Plank",
		description: "Oblique and QL endurance builder. Essential for lateral core stability.",
		howTo: [
			"Lie on one side, forearm under shoulder, feet stacked.",
			"Lift hips so body forms a straight line.",
			"Reach top arm up or rest on hip; hold without collapsing.",
			"Switch sides each set."
		],
		tips: [
			"Elbow under shoulder; push the floor away.",
			"Stack or stagger feet; hips lifted in one long line.",
			"Don’t let the top hip roll forward or collapse."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["obliques", "transverse"],
		met: 3.5,
		unit: "hold",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 30,
		restSeconds: 12,
		weighted: false,
		popularRank: 10,
		...media("side-plank"),
		cues: [
			"Stack feet",
			"Hips high",
			"Long line",
			"Hold"
		]
	},
	{
		id: "v-up",
		name: "V-Up",
		shortName: "V-Up",
		description: "Explosive full-range ab flexion that lights up upper and lower abs together.",
		howTo: [
			"Start fully lying flat on your back with arms extended overhead on the floor and legs straight on the floor.",
			"Simultaneously lift legs and torso to form a V, reaching hands toward toes.",
			"Lower with control all the way back to flat on the floor.",
			"Keep neck long; lead with the chest, not the chin."
		],
		tips: [
			"Every rep starts flat on the floor — arms and legs down.",
			"Reach long with arms and legs at the same time into a V.",
			"Soft landing — control both the up and the down."
		],
		equipment: ["bodyweight"],
		difficulty: "intermediate",
		focus: [
			"upper abs",
			"lower abs",
			"full core"
		],
		met: 4.5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 11,
		...media("v-up"),
		cues: [
			"Start flat",
			"Jackknife V",
			"Touch toes",
			"Flat again"
		]
	},
	{
		id: "dead-bug",
		name: "Dead Bug",
		shortName: "Dead Bug",
		description: "Rehab-to-performance anti-extension drill: opposite arm and leg extend while the low back stays glued down.",
		howTo: [
			"Lie on your back. Arms reach straight up toward the ceiling. Hips and knees bent 90° (tabletop).",
			"Press your low back firmly into the floor and brace.",
			"Slowly extend your RIGHT arm overhead toward the floor while straightening your LEFT leg toward the floor — left arm and right knee stay in tabletop.",
			"Return to the start, then switch: LEFT arm + RIGHT leg. Never extend both arms or both legs together."
		],
		tips: [
			"Low back stays pressed down for every rep — if it arches, reduce the range.",
			"Always opposite limbs: right arm with left leg, then left arm with right leg.",
			"Exhale as limbs extend; move slow and even."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["transverse", "full core"],
		met: 2.8,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 10,
		weighted: false,
		popularRank: 12,
		...media("dead-bug"),
		cues: [
			"Tabletop",
			"Brace back",
			"Opposite extend",
			"Switch sides"
		]
	},
	{
		id: "hollow-hold",
		name: "Hollow Body Hold",
		shortName: "Hollow",
		description: "Gymnastics-derived isometric that builds dense core tension and bodyline strength.",
		howTo: [
			"Lie on back, press low back into the floor.",
			"Lift shoulders and legs slightly off the floor into a banana / hollow shape; arms reach long by the ears.",
			"Hold the hollow without letting ribs flare or low back peel up.",
			"Optional advanced: rock gently head-to-heels while keeping the hollow shape locked."
		],
		tips: [
			"Glue low back to the floor before lifting limbs.",
			"Long banana shape — ribs down, not flaring.",
			"Scale by bending knees or bringing arms to sides."
		],
		equipment: ["bodyweight"],
		difficulty: "intermediate",
		focus: ["transverse", "full core"],
		met: 4,
		unit: "hold",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 30,
		restSeconds: 12,
		weighted: false,
		popularRank: 13,
		...media("hollow-hold"),
		cues: [
			"Low back glued",
			"Banana shape",
			"Arms by ears",
			"Hold / rock"
		]
	},
	{
		id: "flutter-kick",
		name: "Flutter Kick",
		shortName: "Flutters",
		description: "Lower-ab endurance move used in military PT and swim dryland training.",
		howTo: [
			"Lie on back, hands under glutes, shoulders slightly lifted.",
			"Raise both legs only a few inches off the floor (about 6–12\").",
			"Kick small, fast alternating pulses — legs stay low and never cross or scissors high.",
			"Keep low back pressed down the entire set."
		],
		tips: [
			"Shoulders slightly up; hands under glutes for support.",
			"Small rapid kicks with legs nearly parallel to the floor — not high scissors.",
			"If low back peels up, raise legs a bit higher."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["lower abs", "hip flexors"],
		met: 4,
		unit: "time",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 35,
		restSeconds: 12,
		weighted: false,
		popularRank: 14,
		...media("flutter-kick"),
		cues: [
			"Shoulders up",
			"Legs low hover",
			"Kick small",
			"Core tight"
		]
	},
	{
		id: "weighted-russian-twist",
		name: "Weighted Russian Twist",
		shortName: "Wtd Twist",
		description: "Russian twists with a 25 lb or 45 lb plate for serious oblique loading.",
		howTo: [
			"Sit leaning back ~45°, feet elevated if possible.",
			"Hold a plate at chest or with arms extended.",
			"Rotate fully side to side, plate tracking with the torso.",
			"Keep hips stable; do not let the plate pull you off balance."
		],
		tips: [
			"Plate tracks with the torso, arms stay long or tight.",
			"Rotate fully each side without collapsing the chest.",
			"Start with 25s; only jump to 45s with clean control."
		],
		equipment: ["plate"],
		difficulty: "intermediate",
		focus: ["obliques", "full core"],
		met: 5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 20,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: true,
		popularRank: 15,
		...media("weighted-russian-twist"),
		cues: [
			"Hold plate",
			"Twist right",
			"Twist left",
			"Stay tall"
		]
	},
	{
		id: "landmine-rotation",
		name: "Landmine Rotation",
		shortName: "Landmine",
		description: "Standing anti-rotation / rotational power with a barbell in a landmine (or corner) plus plates.",
		howTo: [
			"Anchor a barbell in a landmine or solid corner; load 25s or 45s as needed.",
			"Stand facing the end of the bar, hands stacked on the sleeve.",
			"Rotate the bar in an arc hip-to-hip, pivoting feet as needed.",
			"Brace hard through the midsection; do not yank with arms alone."
		],
		tips: [
			"Soft knees, tall posture; power from hips and core.",
			"Arc the bar hip-to-hip; don’t yank with the arms.",
			"Brace midsection at both ends of the swing."
		],
		equipment: ["barbell", "plate"],
		difficulty: "intermediate",
		focus: ["obliques", "full core"],
		met: 5.5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: true,
		popularRank: 16,
		...media("landmine-rotation"),
		cues: [
			"Grip sleeve",
			"Arc right",
			"Arc left",
			"Brace midsection"
		]
	},
	{
		id: "reverse-crunch",
		name: "Reverse Crunch",
		shortName: "Reverse",
		description: "Posterior pelvic tilt focus that nails the lower rectus without neck strain.",
		howTo: [
			"Lie on back, knees bent ~90°, feet off the floor, arms by sides or light hold on the floor.",
			"Curl the pelvis off the floor by bringing knees toward the chest — tailbone lifts.",
			"Slowly lower hips and feet without letting them crash down.",
			"Avoid swinging with momentum; the work is the pelvis curl, not a full roll-up."
		],
		tips: [
			"Curl the pelvis up — think tailbone toward ribs.",
			"Avoid swinging knees with momentum.",
			"Lower hips quietly without feet crashing down."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["lower abs"],
		met: 3.5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 14,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 17,
		...media("reverse-crunch"),
		cues: [
			"Knees tabletop",
			"Curl pelvis",
			"Squeeze",
			"Lower soft"
		]
	},
	{
		id: "bird-dog",
		name: "Bird Dog",
		shortName: "Bird Dog",
		description: "True bird dog: on all fours, extend opposite arm and leg, then switch. Builds anti-rotation core, glutes, and spinal health.",
		howTo: [
			"Start on all fours — hands under shoulders, knees under hips, neutral spine.",
			"Reach RIGHT arm straight forward and LEFT leg straight back until body is long and level. Hips stay square.",
			"Hold a beat, return to all fours.",
			"Switch: LEFT arm forward + RIGHT leg back. Alternate sides for the whole set."
		],
		tips: [
			"This is NOT lying down — hands and knees the whole time.",
			"Reach long without twisting or hiking the hip.",
			"Move slow; pause 1s at full extension each side."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: [
			"transverse",
			"full core",
			"posterior"
		],
		met: 2.5,
		unit: "time",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 40,
		restSeconds: 10,
		weighted: false,
		popularRank: 18,
		...media("bird-dog"),
		cues: [
			"All fours",
			"Opposite reach",
			"Hold level",
			"Switch sides"
		]
	},
	{
		id: "crunch",
		name: "Crunch",
		shortName: "Crunch",
		description: "Short-range spinal flexion for the upper rectus — shoulders lift, low back stays down. Not a full sit-up.",
		howTo: [
			"Start lying flat: knees bent, feet flat, shoulders and upper back fully on the floor, hands across chest or lightly behind head.",
			"Curl only the shoulders and upper back a few inches off the floor by shortening the abs — ribs toward hips.",
			"Pause at the peak (scapulae off, lower back still glued to the floor), then lower shoulders fully back to the mat.",
			"Never sit all the way up — if the low back lifts, the range is too big."
		],
		tips: [
			"Every rep starts with shoulders on the ground.",
			"Lower back stays pressed down the whole set — short range is correct.",
			"If you sit fully upright, you’ve gone too far (that’s a sit-up)."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["upper abs"],
		met: 3,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 15,
		defaultSeconds: 0,
		restSeconds: 10,
		weighted: false,
		popularRank: 19,
		...media("crunch"),
		cues: [
			"Knees bent",
			"Curl shoulders",
			"Squeeze abs",
			"Lower slow"
		]
	},
	{
		id: "penguin-crunch",
		name: "Penguin Crunch",
		shortName: "Penguin",
		description: "Also called heel touches or ankle taps — lying side-to-side oblique pulses. Reach each heel without sitting up.",
		howTo: [
			"Lie flat on your back, knees bent, feet flat on the floor — shoulders mostly stay on the ground.",
			"Brace lightly, then slide your left hand down toward your left heel while the left shoulder shifts slightly left along the floor.",
			"Return and reach the right hand to the right heel the same way — short side-to-side pulses, not a sit-up.",
			"Keep the upper back low; only a small twist and shoulder slide as you reach each ankle."
		],
		tips: [
			"Shoulders mostly stay on the mat — you’re sliding, not sitting up.",
			"Reach for the heel by shortening the side abs.",
			"Feet stay planted; knees track over toes."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["obliques", "upper abs"],
		met: 3.2,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 24,
		defaultSeconds: 0,
		restSeconds: 10,
		weighted: false,
		popularRank: 20,
		...media("penguin-crunch"),
		cues: [
			"Feet flat",
			"Reach right heel",
			"Reach left heel",
			"Stay low"
		]
	},
	{
		id: "heel-touch",
		name: "Heel Touch",
		shortName: "Heel Touch",
		description: "Same family as the penguin crunch — side-to-side heel reaches lying down. Prefer Penguin Crunch in circuits.",
		howTo: [
			"Lie flat on your back, knees bent, feet flat, shoulders mostly on the ground.",
			"Slide right hand to right heel, then left hand to left heel — shoulders shift slightly along the floor with each reach.",
			"Keep the upper back low; this is a side-reach, not a sit-up.",
			"Pulse with control, not momentum."
		],
		tips: [
			"Shoulders mostly stay on the mat while you twist to each heel.",
			"Reach for heels by shortening the side abs.",
			"Don’t sit up — this is a lying side-reach."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["obliques", "upper abs"],
		met: 3.2,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 24,
		defaultSeconds: 0,
		restSeconds: 10,
		weighted: false,
		popularRank: 21,
		...media("heel-touch"),
		cues: [
			"Lie down",
			"Touch right heel",
			"Touch left heel",
			"Stay braced"
		]
	},
	{
		id: "toe-touch",
		name: "Toe Touch Crunch",
		shortName: "Toe Touch",
		description: "Legs vertical, reach hands to toes — pure upper-ab short-range crunch.",
		howTo: [
			"Lie on back with legs straight up toward the ceiling (or slightly bent).",
			"Reach both hands up and actually touch your toes, curling shoulders off the floor.",
			"Lower shoulders with control; keep legs tall.",
			"Exhale on each reach — fingertips should meet the toes every rep."
		],
		tips: [
			"Legs stay vertical; only the torso crunches.",
			"Actually touch the toes each rep.",
			"Soft knees if hamstrings are tight."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["upper abs"],
		met: 3.3,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 15,
		defaultSeconds: 0,
		restSeconds: 10,
		weighted: false,
		popularRank: 22,
		...media("toe-touch"),
		cues: [
			"Legs up",
			"Touch toes",
			"Squeeze",
			"Lower soft"
		]
	},
	{
		id: "plank-shoulder-tap",
		name: "Plank Shoulder Tap",
		shortName: "Shoulder Tap",
		description: "High plank anti-rotation — tap opposite shoulder, then switch sides.",
		howTo: [
			"Start in a strong high plank, feet a bit wider than hips.",
			"Tap left hand to right shoulder, place hand back down.",
			"Tap right hand to left shoulder, place hand back down — alternate every rep.",
			"Keep hips square and quiet — minimize rotation."
		],
		tips: [
			"Feet wide for a stable base.",
			"Hips stay level — no side-to-side sway.",
			"Slow alternate taps beat sloppy speed."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["transverse", "full core"],
		met: 4,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 16,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 23,
		...media("plank-shoulder-tap"),
		cues: [
			"High plank",
			"Tap right",
			"Tap left",
			"Hips quiet"
		]
	},
	{
		id: "plank-hip-dip",
		name: "Plank Hip Dip",
		shortName: "Hip Dip",
		description: "Forearm plank with controlled hip drops side to side for oblique endurance.",
		howTo: [
			"Hold a forearm plank (elbows under shoulders).",
			"Slowly dip the right hip toward the floor, then return to center.",
			"Dip the left hip toward the floor, then return — alternate sides.",
			"Keep elbows planted and ribs down; no crashing hips."
		],
		tips: [
			"Forearms stay fixed; motion is at the hips.",
			"Dip only as far as you can control.",
			"Side or three-quarter rear angle shows the dip best."
		],
		equipment: ["bodyweight"],
		difficulty: "intermediate",
		focus: [
			"obliques",
			"transverse",
			"full core"
		],
		met: 4.2,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 16,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 24,
		...media("plank-hip-dip"),
		cues: [
			"Forearm plank",
			"Dip right",
			"Dip left",
			"Brace"
		]
	},
	{
		id: "scissors",
		name: "Scissor Kicks",
		shortName: "Scissors",
		description: "Alternating long-leg crosses hovering off the floor — lower abs + hip flexors.",
		howTo: [
			"Lie on back, hands under glutes, shoulders optional lift.",
			"Raise both legs a few inches.",
			"Cross one leg over the other in a scissor pattern, alternating.",
			"Keep low back pressed into the floor."
		],
		tips: [
			"Long legs, small controlled crosses.",
			"If low back arches, raise legs higher.",
			"Shoulders can stay down if neck fatigues."
		],
		equipment: ["bodyweight"],
		difficulty: "intermediate",
		focus: ["lower abs", "hip flexors"],
		met: 4,
		unit: "time",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 35,
		restSeconds: 12,
		weighted: false,
		popularRank: 25,
		...media("scissors"),
		cues: [
			"Hover legs",
			"Cross over",
			"Switch",
			"Low back down"
		]
	},
	{
		id: "sit-up",
		name: "Sit-Up",
		shortName: "Sit-Up",
		description: "Full-range spinal flexion from flat on the floor to upright torso — classic PT staple.",
		howTo: [
			"Start fully lying flat on the floor with knees bent, feet flat, shoulders on the floor.",
			"Curl up until torso is upright / sitting, arms across chest or reaching forward.",
			"Lower vertebra by vertebra all the way back to the floor with control.",
			"Avoid yanking the neck."
		],
		tips: [
			"Every rep starts with shoulders fully on the floor.",
			"Lead with the chest, not the chin.",
			"Control the descent — no slam."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["upper abs", "full core"],
		met: 3.8,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 26,
		...media("sit-up"),
		cues: [
			"Start floor",
			"Curl up",
			"Sit tall",
			"Lower slow"
		]
	},
	{
		id: "long-arm-crunch",
		name: "Long-Arm Crunch",
		shortName: "Long Arm",
		description: "Crunch with arms extended overhead — longer lever, harder upper abs. Small range only — not a sit-up.",
		howTo: [
			"Lie flat with knees bent, arms straight overhead by ears on the floor.",
			"Crunch only the shoulders a few inches up while keeping arms long by the ears.",
			"Pause at the top, then lower back to the floor with control.",
			"Do not sit all the way up — this is a short crunch, not a sit-up."
		],
		tips: [
			"Arms stay glued by the ears the whole rep.",
			"Small range is correct — quality over height.",
			"Exhale on the crunch."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["upper abs"],
		met: 3.4,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 14,
		defaultSeconds: 0,
		restSeconds: 10,
		weighted: false,
		popularRank: 27,
		...media("long-arm-crunch"),
		cues: [
			"Arms long",
			"Small crunch",
			"Hold",
			"Lower"
		]
	},
	{
		id: "windshield-wiper",
		name: "Floor Windshield Wiper",
		shortName: "Wipers",
		description: "Advanced oblique control — legs sweep side to side like wipers while shoulders stay down.",
		howTo: [
			"Lie on back, arms out in a T, legs vertical (or slightly bent).",
			"Lower both legs together toward one side, stop before the floor.",
			"Sweep through center to the other side.",
			"Keep shoulders pinned; control every inch."
		],
		tips: [
			"Arms press the floor for stability.",
			"Reduce range or bend knees to scale.",
			"Never bounce legs off the floor."
		],
		equipment: ["bodyweight"],
		difficulty: "advanced",
		focus: [
			"obliques",
			"lower abs",
			"full core"
		],
		met: 4.8,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 10,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: false,
		popularRank: 28,
		...media("windshield-wiper"),
		cues: [
			"Legs up",
			"Sweep right",
			"Sweep left",
			"Shoulders pinned"
		]
	},
	{
		id: "dragon-flag",
		name: "Dragon Flag",
		shortName: "Dragon Flag",
		description: "Bruce Lee classic — full-body anti-extension from shoulders, legs long.",
		howTo: [
			"Lie on a bench or floor, grip behind head for anchor.",
			"Lift body into a straight line on the shoulders.",
			"Lower as a rigid plank toward the floor, then raise without bending at the hips.",
			"Scale with tucked knees if needed."
		],
		tips: [
			"Body is one rigid line — no jackknife fold.",
			"Start with negatives and tucks.",
			"Stop before form breaks; quality over ROM."
		],
		equipment: ["bodyweight", "bench"],
		difficulty: "advanced",
		focus: [
			"full core",
			"transverse",
			"lower abs"
		],
		met: 6,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 6,
		defaultSeconds: 0,
		restSeconds: 15,
		weighted: false,
		popularRank: 29,
		...media("dragon-flag"),
		cues: [
			"Anchor grip",
			"Rigid line",
			"Lower slow",
			"Raise long"
		]
	},
	{
		id: "side-crunch",
		name: "Side Crunch",
		shortName: "Side Crunch",
		description: "Lying lateral flexion — short, sharp oblique crunch without gear.",
		howTo: [
			"Lie on your side, knees stacked slightly bent, bottom arm for support.",
			"Crunch top ribs toward top hip.",
			"Pause and lower with control.",
			"Finish all reps, then switch sides."
		],
		tips: [
			"Move ribs to hip, not the whole torso flopping.",
			"Keep neck neutral.",
			"Slow tempo beats high reps with momentum."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["obliques"],
		met: 3,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 14,
		defaultSeconds: 0,
		restSeconds: 10,
		weighted: false,
		popularRank: 30,
		...media("side-crunch"),
		cues: [
			"Lie on side",
			"Ribs to hip",
			"Squeeze",
			"Switch sides"
		]
	},
	{
		id: "tuck-up",
		name: "Tuck-Up",
		shortName: "Tuck-Up",
		description: "Hollow-to-tuck snap — gymnastics conditioning for dense midsection power.",
		howTo: [
			"Start in a hollow hold (shoulders and legs lifted).",
			"Snap knees and chest together into a tight tuck balance.",
			"Extend back out to hollow without touching down.",
			"Stay controlled; no rocking onto the low back."
		],
		tips: [
			"Hollow shape between every tuck.",
			"Exhale on the snap-in.",
			"If you tip back, shorten the range."
		],
		equipment: ["bodyweight"],
		difficulty: "advanced",
		focus: [
			"full core",
			"lower abs",
			"upper abs"
		],
		met: 5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 10,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 31,
		...media("tuck-up"),
		cues: [
			"Hollow out",
			"Snap tuck",
			"Balance",
			"Extend long"
		]
	},
	{
		id: "side-plank-hip-dip-left",
		name: "Left Side Plank Hip Dip",
		shortName: "Left SP Dip",
		description: "Side plank on the left forearm with vertical hip dips — left oblique focus.",
		howTo: [
			"Lie on your LEFT side. Left forearm under left shoulder, feet stacked.",
			"Lift hips into a solid left side plank.",
			"Lower the left hip toward the floor, then drive it back up.",
			"Stay on the left side for the whole set."
		],
		tips: [
			"Dip is vertical under the hip, not a twist.",
			"Left elbow under left shoulder the whole time.",
			"Shorter range beats collapsed form."
		],
		equipment: ["bodyweight"],
		difficulty: "intermediate",
		focus: ["obliques", "transverse"],
		met: 3.8,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 32,
		...media("side-plank-hip-dip-left"),
		cues: [
			"Left side plank",
			"Dip hip",
			"Drive up",
			"Long line"
		]
	},
	{
		id: "side-plank-hip-dip-right",
		name: "Right Side Plank Hip Dip",
		shortName: "Right SP Dip",
		description: "Side plank on the right forearm with vertical hip dips — right oblique focus.",
		howTo: [
			"Lie on your RIGHT side. Right forearm under right shoulder, feet stacked.",
			"Lift hips into a solid right side plank.",
			"Lower the right hip toward the floor, then drive it back up.",
			"Stay on the right side for the whole set."
		],
		tips: [
			"Dip is vertical under the hip, not a twist.",
			"Right elbow under right shoulder the whole time.",
			"Shorter range beats collapsed form."
		],
		equipment: ["bodyweight"],
		difficulty: "intermediate",
		focus: ["obliques", "transverse"],
		met: 3.8,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: false,
		popularRank: 33,
		...media("side-plank-hip-dip-right"),
		cues: [
			"Right side plank",
			"Dip hip",
			"Drive up",
			"Long line"
		]
	},
	{
		id: "swimmer",
		name: "Swimmer",
		shortName: "Swimmer",
		description: "Prone alternating arm/leg lifts — balances all the crunch work with posterior chain and anti-extension control.",
		howTo: [
			"Lie face down, arms extended overhead, legs long.",
			"Lift right arm and left leg a few inches, then switch: left arm + right leg.",
			"Keep forehead toward the mat; don’t crank the neck.",
			"Flutter in a smooth swimming rhythm — small range, continuous."
		],
		tips: [
			"Long body, small lifts — not a huge arch.",
			"Opposite limbs move together.",
			"Exhale steady; squeeze glutes lightly."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: [
			"posterior",
			"full core",
			"transverse"
		],
		met: 3.5,
		unit: "time",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 35,
		restSeconds: 12,
		weighted: false,
		popularRank: 34,
		...media("swimmer"),
		cues: [
			"Face down",
			"Opposite lift",
			"Switch",
			"Long body"
		]
	},
	{
		id: "band-pallof",
		name: "Band Pallof Press",
		shortName: "Pallof",
		description: "Anti-rotation gold with a resistance band — press arms out while the band tries to twist you.",
		howTo: [
			"Anchor a resistance band at chest height to your side.",
			"Stand sideways to the anchor, hold the band at your sternum with both hands.",
			"Press arms straight out, resist the band’s pull, hold 1s, then return.",
			"Complete reps, then face the other way for the other side."
		],
		tips: [
			"Feet planted, glutes soft-on, ribs down.",
			"Only arms move — torso does not rotate.",
			"Step farther from the anchor to make it harder."
		],
		equipment: ["band"],
		difficulty: "intermediate",
		focus: [
			"transverse",
			"obliques",
			"full core"
		],
		met: 3.5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: true,
		popularRank: 35,
		...media("band-pallof"),
		cues: [
			"Band at chest",
			"Press out",
			"Resist twist",
			"Return"
		]
	},
	{
		id: "band-woodchop",
		name: "Band Woodchop",
		shortName: "Woodchop",
		description: "Diagonal chop with a resistance band — rotational power for obliques from high-to-low or low-to-high.",
		howTo: [
			"Anchor band high (or low). Stand side-on, grip with both hands.",
			"Chop diagonally across the body from high to low (or reverse), pivoting feet.",
			"Control the return against the band’s snap.",
			"Finish the set, then switch sides."
		],
		tips: [
			"Power from hips and core, not just arms.",
			"Keep arms long; rotate through the trunk.",
			"Match the band strength to clean form."
		],
		equipment: ["band"],
		difficulty: "intermediate",
		focus: ["obliques", "full core"],
		met: 4.5,
		unit: "reps",
		defaultSets: 1,
		defaultReps: 12,
		defaultSeconds: 0,
		restSeconds: 12,
		weighted: true,
		popularRank: 36,
		...media("band-woodchop"),
		cues: [
			"Grip band",
			"Chop across",
			"Pivot",
			"Control return"
		]
	},
	{
		id: "cobra-stretch",
		name: "Cobra Stretch",
		shortName: "Cobra",
		description: "Gentle back-extension stretch to open the abs and hip flexors after floor work.",
		howTo: [
			"Lie face down, hands under shoulders, legs long.",
			"Press the chest up, hips stay heavy on the floor.",
			"Look slightly forward; breathe into the front of the body.",
			"Hold, then ease down if you need a break."
		],
		tips: [
			"Hips glued down — this is a stretch, not a push-up.",
			"Only go as high as comfortable.",
			"Slow breaths; shoulders away from ears."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["posterior", "full core"],
		met: 2,
		unit: "hold",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 30,
		restSeconds: 8,
		weighted: false,
		popularRank: 90,
		role: "cooldown",
		...media("cobra-stretch"),
		cues: [
			"Hands under shoulders",
			"Chest up",
			"Hips down",
			"Breathe"
		]
	},
	{
		id: "prone-t",
		name: "Prone T Stretch",
		shortName: "Prone T",
		description: "Face-down arms out in a T — opens the chest and upper back after ab work.",
		howTo: [
			"Lie face down, legs long, forehead lightly on the mat.",
			"Extend both arms straight out to the sides like a letter T.",
			"Relax shoulders; optional tiny lift of the hands for activation.",
			"Breathe slowly and hold."
		],
		tips: [
			"Arms stay level with the shoulders.",
			"Don’t crank the neck — forehead soft on mat.",
			"Feel the stretch across the chest."
		],
		equipment: ["bodyweight"],
		difficulty: "beginner",
		focus: ["posterior", "full body"],
		met: 1.8,
		unit: "hold",
		defaultSets: 1,
		defaultReps: 1,
		defaultSeconds: 25,
		restSeconds: 8,
		weighted: false,
		popularRank: 91,
		role: "cooldown",
		...media("prone-t"),
		cues: [
			"Face down",
			"Arms to T",
			"Relax",
			"Breathe"
		]
	}
];

export function getExercise(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function sortByPopular(list: Exercise[] = exercises): Exercise[] {
  return [...list].sort((a, b) => a.popularRank - b.popularRank);
}

export function estimateExerciseCalories(opts: {
  met: number;
  bodyWeightKg: number;
  sets: number;
  reps: number;
  secondsPerSet: number;
  unit: UnitMode;
}): number {
  const { met, bodyWeightKg, sets, reps, secondsPerSet, unit } = opts;
  let workSeconds = 0;
  if (unit === "hold" || unit === "time") workSeconds = sets * Math.max(secondsPerSet, 1);
  else workSeconds = sets * reps * 2.5;
  const totalHours = (workSeconds * 1.1) / 3600;
  const cals = met * bodyWeightKg * totalHours;
  return Math.max(1, Math.round(cals));
}

export function kgFromProfile(weight: number, unit: "lb" | "kg"): number {
  return unit === "kg" ? weight : weight * 0.453592;
}

export function cmFromProfile(height: number, unit: "in" | "cm"): number {
  return unit === "cm" ? height : height * 2.54;
}

export function estimateBmr(weightKg: number, heightCm: number, age: number): number {
  const male = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const female = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return Math.round((male + female) / 2);
}
