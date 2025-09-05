import mongoose from "mongoose";

const { Schema } = mongoose;

const refreshTokenSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
	token: { type: String, required: true, unique: true },
	isRevoked: { type: Boolean, default: false, index: true },
	expiresAt: { type: Date },
	createdAt: { type: Date, default: Date.now }
});

// TTL index for automatic cleanup when expiresAt passes
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.models.RefreshToken || mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;


