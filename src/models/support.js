/* eslint-disable func-names */
import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ['user', 'agent', 'system'],
      required: true
    },
    senderId: mongoose.Schema.Types.ObjectId,
    content: {
      type: String,
      required: true
    },
    attachments: [
      {
        url: String,
        filename: String,
        mimetype: String,
        size: Number
      }
    ],
    seen: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'ended', 'transferred', 'abandoned'],
      default: 'waiting',
      index: true
    },
    userInfo: {
      username: String,
      email: String,
      accountType: String,
      avatar: String
    },
    issue: {
      category: {
        type: String,
        enum: ['general', 'account', 'technical', 'billing', 'feature', 'other'],
        default: 'general'
      },
      summary: String
    },
    messages: [messageSchema],
    ratings: {
      score: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String,
      submittedAt: Date
    },
    metadata: {
      browser: String,
      device: String,
      platform: String,
      ipAddress: String,
      location: String
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    assignedAt: Date,
    endedAt: Date,
    transferredFrom: mongoose.Schema.Types.ObjectId,
    transferredTo: mongoose.Schema.Types.ObjectId
  },
  { timestamps: true }
);

chatSessionSchema.plugin(mongoosePaginate);

chatSessionSchema.index({ startedAt: -1 });
chatSessionSchema.index({ status: 1, startedAt: -1 });
chatSessionSchema.index({ userId: 1, startedAt: -1 });

chatSessionSchema.virtual('duration').get(function() {
  if (!this.endedAt) return null;
  return (this.endedAt - this.startedAt) / 1000;
});

chatSessionSchema.virtual('waitTime').get(function() {
  if (!this.assignedAt) return null;
  return (this.assignedAt - this.startedAt) / 1000; 
});


chatSessionSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastUpdated = Date.now();
  return this.save();
};

chatSessionSchema.methods.endChat = function(reason = 'completed') {
  this.status = 'ended';
  this.endedAt = Date.now();
  this.metadata = { ...this.metadata, endReason: reason };
  return this.save();
};

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;