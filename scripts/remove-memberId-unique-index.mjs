import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || 'stagpower-gym';
// Build full URI with database name
// URI format: mongodb://host:port/dbname?options
// If URI doesn't have database name (no / after port), append it
let MONGODB_FULL_URI;
if (MONGODB_URI.match(/:\d+\//)) {
    // URI already has database name (has / after port number)
    MONGODB_FULL_URI = MONGODB_URI;
} else {
    // Append database name before query string if exists
    const queryIndex = MONGODB_URI.indexOf('?');
    if (queryIndex > -1) {
        MONGODB_FULL_URI = `${MONGODB_URI.substring(0, queryIndex)}/${MONGODB_DATABASE}${MONGODB_URI.substring(queryIndex)}`;
    } else {
        MONGODB_FULL_URI = `${MONGODB_URI}/${MONGODB_DATABASE}`;
    }
}
console.log(`🔗 Connecting to: ${MONGODB_FULL_URI}`);

async function removeUniqueIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_FULL_URI);
        console.log('✅ Connected to MongoDB');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

        const db = mongoose.connection.db;
        const collection = db.collection('health_info');
        
        // Check if collection exists
        const collections = await db.listCollections({ name: 'health_info' }).toArray();
        if (collections.length === 0) {
            console.log('⚠️  Collection "health_info" does not exist. Creating it...');
            // Create collection by inserting and deleting a dummy document
            await collection.insertOne({ _id: new mongoose.Types.ObjectId() });
            await collection.deleteOne({});
        }

        // Get all indexes
        const indexes = await collection.indexes();
        console.log('\n📋 Current indexes:');
        indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
        });

        // Check if memberId_1 unique index exists
        const memberIdUniqueIndex = indexes.find(idx => 
            idx.name === 'memberId_1' && idx.unique === true
        );

        if (memberIdUniqueIndex) {
            console.log('\n🗑️  Removing unique index: memberId_1');
            await collection.dropIndex('memberId_1');
            console.log('✅ Successfully removed unique index: memberId_1');
        } else {
            console.log('\nℹ️  No unique index named "memberId_1" found. The index may have already been removed or doesn\'t exist.');
        }

        // Verify compound index exists (for one-to-many relationship)
        const compoundIndex = indexes.find(idx => 
            idx.name === 'memberId_1_createdAt_-1' || 
            (JSON.stringify(idx.key) === '{"memberId":1,"createdAt":-1}')
        );

        if (!compoundIndex) {
            console.log('\n📝 Creating compound index: { memberId: 1, createdAt: -1 }');
            await collection.createIndex({ memberId: 1, createdAt: -1 });
            console.log('✅ Successfully created compound index');
        } else {
            console.log('\n✅ Compound index already exists: { memberId: 1, createdAt: -1 }');
        }

        // Show final indexes
        const finalIndexes = await collection.indexes();
        console.log('\n📋 Final indexes:');
        finalIndexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
        });

        console.log('\n✅ Script completed successfully!');
        console.log('💡 Now you can create multiple HealthInfo records for the same memberId.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the script
removeUniqueIndex()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Failed:', error);
        process.exit(1);
    });
