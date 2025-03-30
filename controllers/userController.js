// const User = require('../models/User');

// const getUsers = async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const createUser = async (req, res) => {
//   const { username, password, role } = req.body;

//   try {
//     const newUser = new User({ username, password, role });
//     await newUser.save();
//     res.status(201).json(newUser);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const updateUser = async (req, res) => {
//   const { id } = req.params;
//   const { username, password, role } = req.body;

//   try {
//     const updatedUser = await User.findByIdAndUpdate(
//       id,
//       { username, password, role },
//       { new: true }
//     );

//     if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// const deleteUser = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const deletedUser = await User.findByIdAndDelete(id);
//     if (!deletedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

//     res.status(200).json({ message: 'Xóa người dùng thành công' });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// module.exports = { getUsers, createUser, updateUser, deleteUser };
