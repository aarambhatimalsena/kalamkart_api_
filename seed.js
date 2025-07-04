import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';
import User from './models/User.js';


dotenv.config();
await connectDB(); 

const admin = {
  name: 'Aarambha Timalsena',
  email: 'timalsenaaarambha75@gmail.com',
  password: '123456',
  role: 'admin', 
};



const products = [
  {name: 'Apsara Pencil',
    description: 'Smooth writing pencil',
    category: 'Pens',
    price: 10,
    stock: 200,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382507/apsara_pencil_xs6csl.jpg',
  },
  {
    name: 'Reynolds Ball Pen',
    description: 'Blue ink pen for everyday use',
    category: 'Pens',
    price: 15,
    stock: 150,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747383688/Reynolds_ball_pen_ai0tde.jpg',
  },
  {
    name: 'Linc Gel Pen',
    description: 'Smooth gel ink pen',
    category: 'Pens',
    price: 20,
    stock: 100,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382507/Linc_Gel_Pen_tq2x5w.jpg',
  },
  {
    name: 'Camel Drawing Pencil',
    description: 'Set of drawing pencils',
    category: 'Pens',
    price: 50,
    stock: 60,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382507/camel-drawing-pencil_zdruuz.jpg',
  },
  {
    name: 'Mechanical Pencil',
    description: 'Refillable mechanical pencil',
    category: 'Pens',
    price: 25,
    stock: 80,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747383807/Mechanical_pencil_b1sk2v.jpg',
  },
  {
    name: 'Ink Bottle',
    description: 'Blue fountain pen ink',
    category: 'Pens',
    price: 35,
    stock: 60,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382506/Ink_bottle_sg1d2x.jpg',
  },
  {
    name: 'Refill Lead 0.5mm',
    description: 'Leads for mechanical pencils',
    category: 'Pens',
    price: 15,
    stock: 100,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382505/Refill_Lead_0.5mm_qaz4tf.jpg',
  },
  {
    name: 'Classmate Notebook',
    description: '200-page ruled notebook',
    category: 'Notebooks',
    price: 40,
    stock: 100,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382506/Classmate_Notebook_tdgdbt.jpg',
  },
  {
    name: 'Register Book',
    description: 'Large format register',
    category: 'Notebooks',
    price: 90,
    stock: 40,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382505/Register_Book_edibgz.jpg',
  },
  {
    name: 'Drawing Sheet Pad',
    description: 'A4 size drawing sheets',
    category: 'Notebooks',
    price: 60,
    stock: 70,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382505/Drawing_Sheet_Pad_qajufx.jpg',
  },
  {
    name: 'Sticky Notes',
    description: 'Multicolor sticky note pack',
    category: 'Notebooks',
    price: 35,
    stock: 120,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382504/Sticky_Notes_rg1eov.jpg',
  },
  {
    name: 'Graph Notebook',
    description: 'Notebook with graph pages',
    category: 'Notebooks',
    price: 55,
    stock: 50,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382504/Graph_Notebook_jmu9si.jpg',
  },
  {
    name: 'Sticky Flag Set',
    description: 'Colorful sticky flags for marking pages',
    category: 'Notebooks',
    price: 30,
    stock: 120,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382504/Sticky_Flag_Set_hw0n3i.jpg',
  },
  {
    name: 'Spiral Notebook',
    description: '100-page spiral bound notebook',
    category: 'Notebooks',
    price: 45,
    stock: 90,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382503/Spiral_Notebook_k1az6k.jpg',
  },
  {
    name: 'Bullet Journal',
    description: 'Dot grid bullet journal',
    category: 'Notebooks',
    price: 85,
    stock: 30,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382503/Bullet_Journal_anca7o.jpg',
  },
  {
    name: 'Camel Crayons',
    description: 'Set of 12 wax crayons',
    category: 'Markers',
    price: 30,
    stock: 90,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382503/Camel_Crayons_dsguav.jpg',
  },
  {
    name: 'Faber Castell Markers',
    description: 'Set of sketch pens',
    category: 'Markers',
    price: 75,
    stock: 60,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382502/Faber_Castell_Markers_ysnfgo.jpg',
  },
  {
    name: 'Watercolor Set',
    description: '12-color water paint',
    category: 'Markers',
    price: 95,
    stock: 50,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382502/Watercolor_Set_swa7f8.jpg',
  },
  {
    name: 'Oil Pastels',
    description: '24 color oil pastel set',
    category: 'Markers',
    price: 100,
    stock: 40,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382502/Oil_Pastels_e8sard.jpg',
  },
  {
    name: 'Permanent Marker',
    description: 'Black permanent marker',
    category: 'Markers',
    price: 20,
    stock: 150,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382502/Permanent_Marker_tkbugj.png',
  },
  {
    name: 'Whiteboard Marker',
    description: 'Dry-erase marker, black',
    category: 'Markers',
    price: 25,
    stock: 80,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382504/Whiteboard_Marker_m88hox.jpg',
  },
  {
    name: 'Brush Pen Set',
    description: 'Flexible tip brush pens for art',
    category: 'Markers',
    price: 150,
    stock: 40,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382502/Brush_Pen_Set_bqd9vw.jpg',
  },
  {
    name: 'Compass Box',
    description: 'Full geometry set',
    category: 'Geometry Tools',
    price: 60,
    stock: 70,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382508/Compass_Box_ejxxdc.jpg',
  },
  {
    name: 'Protractor',
    description: '180° plastic protractor',
    category: 'Geometry Tools',
    price: 10,
    stock: 200,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382508/Protractor_wnfjwd.jpg',
  },
  {
    name: 'Divider Tool',
    description: 'Precision divider',
    category: 'Geometry Tools',
    price: 25,
    stock: 90,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382508/Divider_Tool_zlx5jh.jpg',
  },
  {
    name: 'Ruler Set',
    description: '15cm and 30cm ruler combo',
    category: 'Geometry Tools',
    price: 20,
    stock: 100,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382508/Ruler_Set_ueie8n.jpg',
  },
  {
    name: 'Set Squares',
    description: '45° and 60° triangle rulers',
    category: 'Geometry Tools',
    price: 30,
    stock: 80,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382507/Set_Squares_dmfvfz.jpg',
  },
  {
    name: 'Stapler',
    description: 'Standard office stapler',
    category: 'Folders & Files',
    price: 50,
    stock: 60,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382507/Stapler_me031z.jpg',
  },
  {
    name: 'Punch Machine',
    description: 'Double hole punch',
    category: 'Folders & Files',
    price: 120,
    stock: 30,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382506/Punch_machine_jrgqvw.jpg',
  },
  {
    name: 'Binder Clips',
    description: 'Set of medium clips',
    category: 'Folders & Files',
    price: 40,
    stock: 100,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382506/Binder_Clips_clbk4a.jpg',
  },
  {
    name: 'Tape Dispenser',
    description: 'Heavy-duty tape cutter',
    category: 'Folders & Files',
    price: 80,
    stock: 45,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382506/Tape_Dispenser_jvjibt.jpg',
  },
  {
    name: 'Correction Pen',
    description: 'Quick-dry correction pen',
    category: 'Folders & Files',
    price: 25,
    stock: 75,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382506/Correction_Pen_sqe1ko.jpg',
  },
  {
    name: 'Label Sticker Pack',
    description: 'Adhesive labels for files',
    category: 'Folders & Files',
    price: 20,
    stock: 110,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382505/Label_Sticker_Pack_ljuy8t.jpg',
  },
  {
    name: 'Filing Folder',
    description: 'Expandable document holder',
    category: 'Folders & Files',
    price: 60,
    stock: 70,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382505/Filing_Folder_xgqxb1.jpg',
  },
  {
    name: 'Glue Stick',
    description: 'Non-toxic glue stick',
    category: 'Art Supplies',
    price: 15,
    stock: 200,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382504/Glue_Stick_wpvlfc.jpg',
  },
  {
    name: 'Craft Scissors',
    description: 'Zigzag edge scissors',
    category: 'Art Supplies',
    price: 35,
    stock: 100,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382504/Craft_Scissors_wzdrxa.jpg',
  },
  {
    name: 'Glitter Pack',
    description: 'Color glitter tubes',
    category: 'Art Supplies',
    price: 60,
    stock: 80,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382504/Glitter_Pack_zpo3mn.jpg',
  },
  {
    name: 'Craft Paper Set',
    description: 'Multicolor paper pack',
    category: 'Art Supplies',
    price: 50,
    stock: 70,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382503/Craft_Paper_Set_kudlkh.jpg',
  },
  {
    name: 'Paint Brushes',
    description: 'Set of 6 brushes',
    category: 'Art Supplies',
    price: 55,
    stock: 60,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382502/Paint_brushes_bl1mrx.jpg',
  },
  {
    name: 'Complete Stationery Kit',
    description: 'Notebook, pens, pencil, sharpener, and eraser',
    category: 'Stationery Sets',
    price: 180,
    stock: 40,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382505/Complete_Stationery_Kit_p8rzfl.jpg',
  },
  {
    name: 'Student Exam Pack',
    description: 'Everything needed for exams',
    category: 'Stationery Sets',
    price: 150,
    stock: 30,
    image: 'https://res.cloudinary.com/djv58awy8/image/upload/v1747382502/Student_Exam_Pack_jnlegs.jpg',
  }
];

try {
  // Clean up only existing products
  await Product.deleteMany();

  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: admin.email });
  if (!existingAdmin) {
    const createdAdmin = new User(admin);
    await createdAdmin.save();
    console.log(`✅ Admin user created: ${createdAdmin.email}`);
  } else {
    console.log(`ℹ️ Admin already exists: ${existingAdmin.email}`);
  }

  // Insert Products
  const createdProducts = await Product.insertMany(products);
  console.log(`✅ Seeded ${createdProducts.length} products!`);

  process.exit();
} catch (error) {
  console.error(`❌ Seeding error: ${error}`);
  process.exit(1);
}


