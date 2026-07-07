import mongoose from "mongoose";

const uri = "mongodb://balajiaadi2000_db_user:India%40123@ac-2ezrvfl-shard-00-00.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-01.31n62rt.mongodb.net:27017,ac-2ezrvfl-shard-00-02.31n62rt.mongodb.net:27017/task-management?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(uri);

  const Note = mongoose.connection.collection('notes');
  
  const parentId = new mongoose.Types.ObjectId('69e7505fc05bf5f0580b80b1');
  const childIds = [
    '69e7505fc05bf5f0580b80b3',
    '69e7505fc05bf5f0580b80b5',
    '69e7505fc05bf5f0580b80b7',
    '69e7505fc05bf5f0580b80b9',
    '69e7505fc05bf5f0580b80bb',
    '69e7505fc05bf5f0580b80bd',
    '69e75060c05bf5f0580b80bf',
    '69e75060c05bf5f0580b80c1',
    '69e75060c05bf5f0580b80c3',
    '69e75060c05bf5f0580b80c5'
  ].map(id => new mongoose.Types.ObjectId(id));

  const allIds = [parentId, ...childIds];
  const notes = await Note.find({
    taskId: { $in: allIds }
  }).toArray();

  console.log("Found Linked Notes Count:", notes.length);
  console.log(notes.map(n => ({
    id: n._id,
    title: n.title,
    taskId: n.taskId
  })));

  process.exit();
}
run();
