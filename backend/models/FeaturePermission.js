import mongoose from 'mongoose';

const featurePermissionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    enabledForRoles: [{ type: String }],
    enabledAcademies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Academy' }],
    isGlobal: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model('FeaturePermission', featurePermissionSchema);
