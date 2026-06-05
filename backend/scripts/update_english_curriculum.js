import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI;
const SPEAKING_PARENT_ID = "69e5139e075177f2937347d4";
const WRITING_PARENT_ID = "69e5139f075177f29373483b";

// 100 Simple Rotating Prompts
const basePrompts = [
  // 1-4
  { type: "Past", text: "a beautiful childhood memory" },
  { type: "Future", text: "your plans for your next trip" },
  { type: "Present", text: "your favorite food and why you love it" },
  { type: "Mixed", text: "whether you prefer reading books or watching videos" },
  // 5-8
  { type: "Past", text: "your high school graduation day or a memorable school event" },
  { type: "Future", text: "where you want to live in five years and why" },
  { type: "Present", text: "your daily morning routine" },
  { type: "Mixed", text: "whether you prefer working from home or in an office" },
  // 9-12
  { type: "Past", text: "a memorable conversation you had with a friend" },
  { type: "Future", text: "a tech stack or coding skill you want to learn next" },
  { type: "Present", text: "your favorite hobby and how you started it" },
  { type: "Mixed", text: "whether you prefer cooking at home or eating out" },
  // 13-16
  { type: "Past", text: "a book or movie you read/watched in the past that changed your perspective" },
  { type: "Future", text: "your long-term career goals" },
  { type: "Present", text: "the weather today and how it affects your mood" },
  { type: "Mixed", text: "if you think social media does more harm than good" },
  // 17-20
  { type: "Past", text: "your first day at a new job or school" },
  { type: "Future", text: "what you would do if you won the lottery" },
  { type: "Present", text: "your current exercise or fitness routine" },
  { type: "Mixed", text: "whether money or job satisfaction is more important to you" },
  // 21-24
  { type: "Past", text: "a mistake you made in the past and what you learned from it" },
  { type: "Future", text: "how you think artificial intelligence will change your job in 10 years" },
  { type: "Present", text: "the room you are sitting in right now" },
  { type: "Mixed", text: "whether you prefer city life or countryside life" },
  // 25-28
  { type: "Past", text: "a historic event that happened during your lifetime" },
  { type: "Future", text: "your dream vacation destination" },
  { type: "Present", text: "the music you like to listen to while working" },
  { type: "Mixed", text: "if you think college degrees are still necessary in tech" },
  // 29-32
  { type: "Past", text: "a teacher or mentor who influenced you" },
  { type: "Future", text: "how you plan to spend your next weekend" },
  { type: "Present", text: "the app on your phone that you use the most" },
  { type: "Mixed", text: "whether you prefer tea or coffee" },
  // 33-36
  { type: "Past", text: "a gift you received in the past that meant a lot to you" },
  { type: "Future", text: "a personal coding project you plan to build soon" },
  { type: "Present", text: "your neighborhood and what you like about it" },
  { type: "Mixed", text: "if you think remote work is here to stay permanently" },
  // 37-40
  { type: "Past", text: "an outdoor game you played when you were a kid" },
  { type: "Future", text: "what skills you hope to master in the next year" },
  { type: "Present", text: "a typical lunch or dinner you eat on weekdays" },
  { type: "Mixed", text: "whether you prefer traveling alone or with a group" },
  // 41-44
  { type: "Past", text: "a challenging coding or work task you solved in the past" },
  { type: "Future", text: "how you plan to manage your personal savings" },
  { type: "Present", text: "your current sleeping habits and sleep schedule" },
  { type: "Mixed", text: "if you believe public transport should be completely free" },
  // 45-48
  { type: "Past", text: "a museum, monument, or park you visited in the past" },
  { type: "Future", text: "where you want to travel internationally" },
  { type: "Present", text: "how you structure your daily coding hours" },
  { type: "Mixed", text: "whether you prefer team sports or individual sports" },
  // 49-52
  { type: "Past", text: "a time you got lost in the past and how you found your way" },
  { type: "Future", text: "what you want your lifestyle to look like in ten years" },
  { type: "Present", text: "a favorite restaurant or cafe you go to" },
  { type: "Mixed", text: "whether you prefer cats or dogs as pets" },
  // 53-56
  { type: "Past", text: "a pet you had in the past or a memorable interaction you had with an animal" },
  { type: "Future", text: "how you plan to celebrate your next birthday" },
  { type: "Present", text: "a skill you are currently actively practicing" },
  { type: "Mixed", text: "whether you prefer watching movies at home or in a cinema" },
  // 57-60
  { type: "Past", text: "a time you helped someone in the past and how it made you feel" },
  { type: "Future", text: "what changes you want to make to your workspace" },
  { type: "Present", text: "your favorite season of the year and why" },
  { type: "Mixed", text: "whether you prefer dynamic typing or static typing in coding" },
  // 61-64
  { type: "Past", text: "a holiday or festival you celebrated with your family in the past" },
  { type: "Future", text: "a new language you would like to learn in the future" },
  { type: "Present", text: "a device or gadget you bought recently and how you use it" },
  { type: "Mixed", text: "whether you think cities should have more green spaces" },
  // 65-68
  { type: "Past", text: "a time you had to perform or speak in public in the past" },
  { type: "Future", text: "how you plan to spend your retirement years" },
  { type: "Present", text: "a habit you are trying to build right now" },
  { type: "Mixed", text: "whether you prefer paper books or e-books" },
  // 69-72
  { type: "Past", text: "a trip you took in the past that did not go according to plan" },
  { type: "Future", text: "a habit you want to break in the next few months" },
  { type: "Present", text: "your favorite way to unwind after a stressful day" },
  { type: "Mixed", text: "if you believe learning history is important for the future" },
  // 73-76
  { type: "Past", text: "a toy or game that was your favorite as a child" },
  { type: "Future", text: "what you think the world will look like in 50 years" },
  { type: "Present", text: "a current news topic or trend that interests you" },
  { type: "Mixed", text: "whether you prefer early morning or late night productivity" },
  // 77-80
  { type: "Past", text: "a recipe you tried making for the first time in the past" },
  { type: "Future", text: "a concert or event you want to attend in the future" },
  { type: "Present", text: "a favorite movie character and why you like them" },
  { type: "Mixed", text: "whether you believe soft skills are more important than hard skills" },
  // 81-84
  { type: "Past", text: "a time you had an unexpected visitor" },
  { type: "Future", text: "your plans for the upcoming holiday season" },
  { type: "Present", text: "how you keep in touch with your long-distance friends" },
  { type: "Mixed", text: "whether you prefer sweet food or savory food" },
  // 85-88
  { type: "Past", text: "a funny incident that happened to you in the past" },
  { type: "Future", text: "what you hope to accomplish by the end of this month" },
  { type: "Present", text: "a description of your favorite clothing item" },
  { type: "Mixed", text: "whether you prefer working in silence or with background noise" },
  // 89-92
  { type: "Past", text: "a time you were very proud of yourself in the past" },
  { type: "Future", text: "a career milestone you want to reach in the future" },
  { type: "Present", text: "the chores you have to do at home" },
  { type: "Mixed", text: "if you think space exploration is worth the cost" },
  // 93-96
  { type: "Past", text: "a piece of advice someone gave you in the past that stuck with you" },
  { type: "Future", text: "what you hope to do on your next day off" },
  { type: "Present", text: "how you handle stress in your daily life" },
  { type: "Mixed", text: "whether you prefer summer or winter weather" },
  // 97-100
  { type: "Past", text: "a decision you made in the past that changed your life trajectory" },
  { type: "Future", text: "a book you want to read next" },
  { type: "Present", text: "how you feel right now after completing today's tasks" },
  { type: "Mixed", text: "what you think was the most important lesson from this 100-day practice" }
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const TaskCollection = mongoose.connection.collection("tasks");

    // Fetch all child tasks of both parent tasks
    const speakingTasks = await TaskCollection.find({ parentTask: new mongoose.Types.ObjectId(SPEAKING_PARENT_ID) }).toArray();
    const writingTasks = await TaskCollection.find({ parentTask: new mongoose.Types.ObjectId(WRITING_PARENT_ID) }).toArray();

    console.log(`Loaded ${speakingTasks.length} Speaking tasks and ${writingTasks.length} Writing tasks from DB.`);

    let speakingRescheduleCount = 0;
    let writingRescheduleCount = 0;

    // Reschedule start date: Today (2026-05-31)
    const baseRescheduleDate = new Date("2026-05-31T00:00:00Z");

    // Process Speaking Tasks
    console.log("Processing Speaking Tasks...");
    for (let day = 1; day <= 100; day++) {
      const data = basePrompts[day - 1];
      if (!data) continue;

      let namePattern = `Speaking Practice Day ${day}`;
      if (day === 100) {
        namePattern = "Speaking Practice Final Day";
      }

      const task = speakingTasks.find(t => t.taskName.toLowerCase().trim() === namePattern.toLowerCase().trim());
      if (!task) {
        console.warn(`Could not find task with name "${namePattern}" in DB.`);
        continue;
      }

      // Simple, short prompt
      const description = `Day ${day} (${data.type}): Speak about ${data.text}.`;
      const oldStatus = task.status;
      const isDone = oldStatus === "done";

      let updateFields = {
        taskDescription: description,
        estimatedHours: 0.5
      };

      if (!isDone) {
        const taskStartDate = new Date(baseRescheduleDate);
        taskStartDate.setDate(taskStartDate.getDate() + speakingRescheduleCount);
        
        const taskDueDate = new Date(taskStartDate);
        taskDueDate.setUTCHours(23, 59, 59, 999);

        updateFields.status = "todo";
        updateFields.taskStartDate = taskStartDate;
        updateFields.taskDueDate = taskDueDate;

        // Activity Log entry
        let activityLogs = task.activityLogs || [];
        const logMessage = `Curriculum updated to simplified prompt and rescheduled to ${taskStartDate.toISOString().split("T")[0]}`;
        activityLogs.unshift({
          oldStatus: oldStatus,
          currentStatus: "todo",
          user: null,
          date: new Date(),
          message: logMessage
        });
        updateFields.activityLogs = activityLogs;

        speakingRescheduleCount++;
        console.log(`Updating Speaking Day ${day}: Rescheduled to ${taskStartDate.toISOString().split("T")[0]}`);
      } else {
        console.log(`Updating Speaking Day ${day}: [Done Task - Keeping dates and status]`);
      }

      await TaskCollection.updateOne({ _id: task._id }, { $set: updateFields });
    }

    // Process Writing Tasks
    console.log("Processing Writing Tasks...");
    for (let day = 1; day <= 100; day++) {
      const data = basePrompts[day - 1];
      if (!data) continue;

      let namePattern = `Writing Practice Day ${day}`;
      if (day === 100) {
        namePattern = "Writing Practice Final Day";
      }

      const task = writingTasks.find(t => t.taskName.toLowerCase().trim() === namePattern.toLowerCase().trim());
      if (!task) {
        console.warn(`Could not find task with name "${namePattern}" in DB.`);
        continue;
      }

      // Simple, short prompt
      const description = `Day ${day} (${data.type}): Write about ${data.text}.`;
      const oldStatus = task.status;
      const isDone = oldStatus === "done";

      let updateFields = {
        taskDescription: description,
        estimatedHours: 0.5
      };

      if (!isDone) {
        const taskStartDate = new Date(baseRescheduleDate);
        taskStartDate.setDate(taskStartDate.getDate() + writingRescheduleCount);
        
        const taskDueDate = new Date(taskStartDate);
        taskDueDate.setUTCHours(23, 59, 59, 999);

        updateFields.status = "todo";
        updateFields.taskStartDate = taskStartDate;
        updateFields.taskDueDate = taskDueDate;

        // Activity Log entry
        let activityLogs = task.activityLogs || [];
        const logMessage = `Curriculum updated to simplified prompt and rescheduled to ${taskStartDate.toISOString().split("T")[0]}`;
        activityLogs.unshift({
          oldStatus: oldStatus,
          currentStatus: "todo",
          user: null,
          date: new Date(),
          message: logMessage
        });
        updateFields.activityLogs = activityLogs;

        writingRescheduleCount++;
        console.log(`Updating Writing Day ${day}: Rescheduled to ${taskStartDate.toISOString().split("T")[0]}`);
      } else {
        console.log(`Updating Writing Day ${day}: [Done Task - Keeping dates and status]`);
      }

      await TaskCollection.updateOne({ _id: task._id }, { $set: updateFields });
    }

    console.log("English curriculum update and rescheduling completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

run();
