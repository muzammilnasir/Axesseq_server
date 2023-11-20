const mongoose = require("mongoose");

const contributorSchema = new mongoose.Schema({
  repositoryId: mongoose.Schema.Types.ObjectId,
  total: Number,
  weeks: [
    {
      w: Number,
      a: Number,
      d: Number,
      c: Number,
    },
  ],
  author: mongoose.Schema.Types.Mixed, // Define
  login: String,
  id: Number,
  node_id: String,
  avatar_url: String,
  gravatar_id: String,
  url: String,
  html_url: String,
  followers_url: String,
  following_url: String,
  gists_url: String,
  starred_url: String,
  subscriptions_url: String,
  organizations_url: String,
  repos_url: String,
  events_url: String,
  received_events_url: String,
  type: String,
  site_admin: Boolean,
});

const Contributor = mongoose.model("Contributor", contributorSchema);

module.exports = Contributor;
