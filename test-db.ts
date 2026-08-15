
import { connectDB } from './src/lib/mongoose';
import { Project } from './src/lib/models/Project';

async function test() {
  try {
    await connectDB();
    const projects = await Project.find({});
    console.log('Projects count:', projects.length);
    if (projects.length > 0) {
      console.log('Latest project:', projects[projects.length - 1]);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
test();
