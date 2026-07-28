const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir(path.join(__dirname, 'src'));

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    if (content.includes('clerkId')) {
        content = content.replace(/clerkId:\s*userId/g, 'id: userId');
        content = content.replace(/clerkId:\s*session\.userId/g, 'id: session.userId');
        content = content.replace(/clerkId:\s*id/g, 'id: id');
        // Delete clerkId fields from prisma create blocks if it's there
        content = content.replace(/clerkId:\s*[^,]+,/g, '');
        changed = true;
    }
    
    // Also remove any remaining clerk webhook
    if (file.includes('webhooks\\clerk')) {
      // Just let it be or delete the directory later
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
