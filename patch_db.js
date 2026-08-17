const db = require('./backend/config/db');

const query = `
  ALTER TABLE documents 
  ADD COLUMN uploader_id INT NULL AFTER status;
`;

db.query(query, (err, result) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column uploader_id already exists.');
    } else {
      console.error('Error adding column:', err);
    }
  } else {
    console.log('Successfully added uploader_id column to documents table.');
  }
  process.exit();
});
