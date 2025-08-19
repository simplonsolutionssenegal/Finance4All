import UserSchema from "../models/schemas/User.schema";

export const updateUserRole = async (userId: string, newRole: string) => {
    return UserSchema.findByIdAndUpdate(userId, { role: newRole }, { new: true });
  };
  
  export const toggleUserActiveStatus = async (userId: string) => {
    const user = await UserSchema.findById(userId);
    if (!user) throw new Error('Utilisateur non trouvé');
    user.isActive = !user.isActive;
    return user.save();
  };
  