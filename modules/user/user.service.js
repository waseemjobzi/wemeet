// const { pick, omit, has, isEmpty } = require("lodash");
// const { sendError } = require("../../utils/response");

// class UserService {
//   recruiterUpdateCompanyFields = [
//     "email",
//     "website",
//     "image",
//     "notice_period",
//     "num_employees",
//     "bond",
//     "probation",
//     "linkedin_link",
//     "glassdoor_link",
//     "address",
//   ];

//   updateCandidateAccountFields = [
//     "name",
//     "image",
//     "device",
//     "last_location",
//     "search_distance",
//     "email",
//   ];

  

//   updateCandidate = async (userId, body, username) => {
//     const accountData = pick(body, this.updateCandidateAccountFields);
//     const detailsData = omit(body, this.updateCandidateAccountFields);

//     if (accountData.last_location && accountData.last_location.coords) {
//       accountData.last_location.coords = {
//         coordinates: accountData.last_location.coords,
//       };
//     }

//     if (accountData.search_distance) {
//       accountData["preferences.search_distance"] = accountData.search_distance;

//       delete accountData.search_distance;
//     }
//     if (body.coupon_code) {
//       accountData.coupon_code = body.coupon_code;
//       accountData.deviceId = body.deviceId;
//     }
//     accountData.username = username;
//     accountData.isAppDownloaded = true;
//     let updatedUser;
//     if (body.current_city) {
//       accountData.user_city = body.current_city;
//       detailsData.current_city = body.current_city;
//     }
//     try {
//       updatedUser = await User.findByIdAndUpdate(userId, accountData, {
//         new: true,
//       });
//     } catch (error) {
//       throw new Error(
//         "This email already exists. Please use a different email or write to us at support@jobzi.in"
//       );
//     }

//     const updatedUserDetails = await Applicant.findOneAndUpdate(
//       { userID: userId },
//       detailsData,
//       {
//         new: true,
//       }
//     ).populate({ path: "resume", select: "location" });

//     // if (updatedUser.confirmed) {
//     gee.emit("applicant_updated", updatedUser, updatedUserDetails);
//     // }

//     return {
//       account: updatedUser,
//       details: updatedUserDetails,
//     };
//   };

//   updateUserDeviceDetails = async (userId, role, body, parent_category) => {
//     const updateBody = pick(body, ["device", "last_location"]);
//     if (updateBody.last_location.coords) {
//       updateBody.last_location.coords = {
//         coordinates: updateBody.last_location.coords,
//       };
//     }

//     const updatedUser = await User.findByIdAndUpdate(userId, updateBody, {
//       new: true,
//     }).lean();
//     if (role === roles[0]) {
//       let applicant = await Applicant.findOne({ userID: userId });
//       // && updatedUser.confirmed) {
//       const { last_location } = updatedUser;
//       const {
//         full_address,
//         coords: { coordinates },
//       } = last_location;
//       if (
//         !applicant.function_parent_category == "NonIt" ||
//         !applicant.function_parent_category == "Banking"
//       ) {
//         await this.updateCandidateOnES(updatedUser._id, {
//           full_address,
//           location: coordinates,
//         });
//       }
//     }
//   };

//   updateUserSettings = async (userId, role, body) => {
//     if (body.dnd) {
//       const dndEnd = Date.now() + body.dnd * 60 * 60 * 1000;
//       body.dnd = {
//         value: body.dnd,
//         updatedAt: new Date(),
//         end: dndEnd,
//       };
//     } else if (body.dnd === 0 || body.dnd === null) {
//       body.dnd = {
//         value: 0,
//         updatedAt: new Date(),
//         end: null,
//       };
//     }

//     const currentSettings = (
//       await User.findById(userId).select("preferences").lean()
//     ).preferences;

//     const newSettings = (
//       await User.findByIdAndUpdate(
//         userId,
//         { preferences: { ...currentSettings, ...body } },
//         { new: true }
//       )
//         .lean()
//         .exec()
//     ).preferences;
//     let applicant = await Applicant.findOne({ userID: userId });
//     if (role === userRoles[1] || role === userRoles[2]) {
//       await this.updateRecruiterSettingsOnES(userId, newSettings);
//     } else if (role === userRoles[0]) {
//       if (
//         !applicant.function_parent_category == "NonIt" ||
//         !applicant.function_parent_category == "Banking"
//       ) {
//         await this.updateCandidateSettingsOnES(userId, newSettings);
//       }
//     }
//     return newSettings;
//   };

//   updateRecruiterSettingsOnES = async (userId, data) => {
//     const settings = pick(data, [
//       "call_enabled",
//       "chat_enabled",
//       "email_enabled",
//       "dnd",
//     ]);

//     if (settings.dnd) {
//       settings.dnd = settings.dnd.end;
//     }

//     const updateBody = {
//       chat_enabled: settings.chat_enabled,
//       call_enabled: settings.call_enabled,
//       email_enabled: settings.email_enabled,
//       dnd_end: settings.dnd,
//     };
//     try {
//       const recruiterJobs = await Job.find({
//         recruiter: userId,
//         active: true,
//         blocked: false,
//       })
//         .select("_id")
//         .lean();

//       const jobIds = recruiterJobs.map((item) => item._id);
//       await jobService.updateJobsOnES(jobIds, updateBody);
//     } catch (error) {
//       console.log("currently not able to take actions");
//     }
//     console.log("recruiter settings updated to ES");
//   };

//   updateCandidateSettingsOnES = async (userId, data) => {
//     const settings = pick(data, [
//       "call_enabled",
//       "chat_enabled",
//       "email_enabled",
//       "dnd",
//     ]);

//     if (settings.dnd) {
//       settings.dnd_end = settings.dnd.end;
//       delete settings.dnd;
//     }

//     const response = await global.esClient.update({
//       index: process.env.ES_CANDIDATES_INDEX,
//       id: userId,
//       body: {
//         doc: settings,
//       },
//     });

//     if (response.body.errored) {
//       throw new Error("ES update error");
//     }

//     console.log("candidate settings updated to ES");
//   };

//   blockHRs = async (userIds, blocked = true) => {
//     await User.updateMany({ _id: userIds }, { blocked });

//     const hrJobs = await Job.find({
//       recruiter: userIds,
//     })
//       .select("_id")
//       .lean();
//     const jobIds = hrJobs.map((item) => item._id);

//     const hrProjects = await Project.find({ created_by: userIds })
//       .select("_id")
//       .lean();
//     const projectIds = hrProjects.map((item) => item._id);

//     if (blocked) {
//       await jobService.blockJobs(jobIds);
//       await projectService.disable(projectIds);
//     } else {
//       await jobService.unblockJobs(jobIds);
//       await projectService.enable(projectIds);
//     }
//   };

//   blockCandidate = async (userId, blocked = true) => {
//     await User.updateOne({ _id: userId }, { blocked });

//     if (blocked) {
//       await this.deleteCandidatesFromES([userId]);
//     } else {
//       await this.addCandidateToESUsingID(userId);
//     }

//     const candidateProjects = await Project.find({ created_by: userId })
//       .select("_id")
//       .lean();
//     const projectIds = candidateProjects.map((item) => item._id);
//     if (blocked) {
//       await projectService.disable(projectIds);
//     } else {
//       await projectService.enable(projectIds);
//     }
//   };

//   updateCandidateOnES = async (userId, body) => {
//     const response = await global.esClient.update({
//       index: process.env.ES_CANDIDATES_INDEX,
//       id: userId,
//       body: {
//         doc: body,
//       },
//     });

//     if (response.body.errored) {
//       throw new Error("ES update error");
//     }

//     console.log(`Candidate ${userId} updated on ES`);
//   };
//   updateRecruiterOnES = async (jobIds, updateBody) => {
//     if (isEmpty(jobIds)) {
//       return;
//     }

//     const body = [];
//     for (const id of jobIds) {
//       body.push({
//         update: { _index: process.env.ES_JOBS_INDEX, _id: id },
//       });
//       body.push({ doc: updateBody });
//     }

//     const response = await global.esClient.bulk({
//       body,
//       index: process.env.ES_JOBS_INDEX,
//     });

//     if (response.body.errored) {
//       throw new Error("ES insert error");
//     }

//     console.log("Jobs image updated on ES ");
//   };
//   addCandidateToESUsingID = async (candidateId) => {
//     const account = await User.findById(candidateId).lean();
//     const details = await Applicant.findOne({ userID: candidateId }).lean();

//     if (!details) return;

//     await this.addCandidatesToES([{ account, details }]);
//   };

//   addCandidatesToES = async (candidates) => {
//     const esBody = [];

//     for (const cand of candidates) {
//       const account = cand.account;
//       const details = cand.details;

//       const {
//         coords: { coordinates },
//         full_address,
//       } = account.last_location;
//       const location = [coordinates[0], coordinates[1]];

//       const { chat_enabled, email_enabled, call_enabled, dnd } =
//         account.preferences;

//       const submitData = {
//         email: account.email,
//         name: account.name,
//         phone_number: account.phone_number,
//         designation: details.designation,
//         function_category: details.function_category,
//         skills: details.skills,
//         experience: details.experience,
//         current_salary: details.current_salary,
//         expected_salary: details.expected_salary,
//         highest_education: details.highest_education,
//         gender: details.gender,
//         university_name: details.university_name,
//         actively_looking: details.actively_looking,
//         notice_period: details.notice_period,
//         notice_period_active: details.notice_period_active,
//         immediate_joiner: details.immediate_joiner,
//         resume_filename: details?.resume?.originalname,
//         resume_url: details?.resume?.location,
//         resume_text: details?.resume_text,
//         codename: details?.codename,
//         blocked_companies: details.blocked_companies,
//         full_address,
//         location,
//         isFreelancer: details.isFreelancer,
//         chat_enabled,
//         email_enabled,
//         call_enabled,
//         dnd_end: dnd?.end,
//       };

//       esBody.push({
//         index: { _index: process.env.ES_CANDIDATES_INDEX, _id: account._id },
//       });
//       esBody.push(submitData);
//     }

//     const response = await global.esClient.bulk({
//       body: esBody,
//       index: process.env.ES_CANDIDATES_INDEX,
//     });

//     if (response.body.errored) {
//       throw new Error("ES jobs insert error");
//     }

//     console.log(`${candidates.length} candidates added/updated to elastic`);
//   };

//   deleteCandidatesFromES = async (userIds) => {
//     const body = userIds.map((id) => ({
//       delete: { _index: process.env.ES_CANDIDATES_INDEX, _id: id },
//     }));

//     await global.esClient.bulk({
//       index: process.env.ES_CANDIDATES_INDEX,
//       body,
//     });

//     console.log(`${userIds.length} candidates delete from ES`);
//   };

//   processCandidates = async (data) => {
//     const users = [];
//     for (let user of data) {
//       try {
//         const name = user["Name"];
//         const email = user["Email"];
//         const phone_number = user["PhoneNumber"];
//         let skill = user["Skills"];
//         const designation = user["Designation"];
//         const experience = user["Experience"];
//         const preferred_location = user["Location"];
//         const function_category = user["Category"];
//         const isFreelancer = user["Freelancer"];
//         const Latitude = user["Lat"];
//         const Longitude = user["Long"];
//         let password = user["PhoneNumber"];
//         let skills = skill.split(",");
//         let userdata = {
//           name,
//           email,
//           phone_number,

//           confirmed: true,
//           role: "CANDIDATE",
//           password,
//           provider: {
//             name: "phone_number",
//           },
//           last_location: {
//             full_address: preferred_location,
//             coords: {
//               coordinates: [Longitude, Latitude],
//             },
//           },
//         };
//         let userModel = new User(userdata);
//         let account = await userModel.save();

//         let applicantData = {
//           designation,
//           experience,
//           preferred_location,
//           userID: account._id,
//           skills,
//           function_category,
//           isFreelancer,
//           codename:
//             freelancerCodeNames[getRandomNumber(freelancerCodeNames.length)],
//         };
//         let applicant = new Applicant(applicantData);
//         let details = await applicant.save();
//         users.push(account, details);
//         await this.addCandidatesToES([{ account, details }]);
//         await mailService.sendMailWithTemplate(
//           email,
//           getMailSubjects(mailTemplateName.CREATE_USER_MAIL),
//           mailTemplateName.CREATE_USER_MAIL,
//           {
//             name,
//             email,
//             phone_number,
//           }
//         );
//       } catch (err) {
//         console.log(err);
//       }
//     }

//     return users;
//   };

//   processNonItCandidates = async (data) => {
//     const users = [];
//     for (let user of data) {
//       try {
//         const name = user["Name"];
//         const phone_number = user["PhoneNumber"];
//         let skill = user["Skills"];
//         const experience = user["Experience"];
//         const preferred_location = user["Location"];
//         const function_parent_category = "NonIt";
//         const isFreelancer = "true";
//         const Latitude = user["Lat"];
//         const Longitude = user["Long"];
//         let password = user["PhoneNumber"];
//         const current_city = "Noida";
//         let skills = skill.split(",");
//         let userdata = {
//           name,
//           phone_number,
//           confirmed: true,
//           role: "CANDIDATE",
//           password,
//           user_city:current_city,
//           provider: {
//             name: "phone_number",
//           },
//           parent_category:function_parent_category,
//           last_location: {
//             full_address: preferred_location,
//             coords: {
//               coordinates: [Longitude, Latitude],
//             },
//           },
//         };
//         let app = await User.findOne({ phone_number });
//         if (!app) {
//           let userModel = new User(userdata);
//           let account = await userModel.save();

//           let applicantData = {
//             experience,
//             current_city,
//             preferred_location,
//             userID: account._id,
//             skills,
//             function_parent_category,
//             isFreelancer,
//             codename:
//               freelancerCodeNames[getRandomNumber(freelancerCodeNames.length)],
//           };
//           let applicant = new Applicant(applicantData);
//           let details = await applicant.save();
//           users.push(account, details);
//         }
//         // await this.addCandidatesToES([{ account, details }]);
//         // await mailService.sendMailWithTemplate(
//         //   email,
//         //   getMailSubjects(mailTemplateName.CREATE_USER_MAIL),
//         //   mailTemplateName.CREATE_USER_MAIL,
//         //   {
//         //     name,email,phone_number
//         //   }
//         // );
//       } catch (err) {
//         console.log(err);
//       }
//     }

//     return users;
//   };
//   processBankCandidates = async (data) => {
//     const users = [];
//     for (let user of data) {
//       try {
//         const name = user["Name"];
//         const phone_number = user["PhoneNumber"];
//         let skill = user["Skills"];
//         const experience = user["Experience"];
//         const preferred_location = user["Branch Location"];
//         const function_parent_category = "Banking";
//         const isFreelancer = "true";
//         const Latitude = user["Lat"];
//         const Longitude = user["Long"];
//         let password = user["PhoneNumber"];
//         let current_company_name=user["Current Bank Name"]
//         const current_city = "Noida";
//         let current_salary=user["CTC"]

//         let skills = skill.split(",");
//         let userdata = {
//           name,
//           phone_number,
//           confirmed: true,
//           role: "CANDIDATE",
//           password,
//           provider: {
//             name: "phone_number",
//           },
//           parent_category:function_parent_category,
//           last_location: {
//             full_address: preferred_location,
//             coords: {
//               coordinates: [Longitude, Latitude],
//             },
//           },
//           branch_location: {
//             full_address: preferred_location,
//             coords: {
//               coordinates: [Longitude, Latitude],
//             },
//           },
//           user_city:current_city
//         };
//         let app = await User.findOne({ phone_number });
//         if (!app) {
//           let userModel = new User(userdata);
//           let account = await userModel.save();

//           let applicantData = {
//             experience,
//             current_city,
//             preferred_location,
//             userID: account._id,
//             skills,
//             current_salary,
//             current_company_name,
//             function_parent_category,
//             isFreelancer,
//             codename:
//               freelancerCodeNames[getRandomNumber(freelancerCodeNames.length)],
//           };
//           let applicant = new Applicant(applicantData);
//           let details = await applicant.save();
//           users.push(account, details);
//         }
//       } catch (err) {
//         console.log(err);
//       }
//     }

//     return users;
//   };

//   updateNonItCandidate = async (userId, body, username) => {
//     const accountData = pick(body, this.updateCandidateAccountFields);
//     const detailsData = omit(body, this.updateCandidateAccountFields);

//     if (accountData.last_location && accountData.last_location.coords) {
//       accountData.last_location.coords = {
//         coordinates: accountData.last_location.coords,
//       };
//     }
//     if (body.branch_location) {
//       accountData.branch_location=body.branch_location
//       accountData.branch_location.coords = {
//         coordinates: body.branch_location.coords,
//       };
//     }
//     if (accountData.search_distance) {
//       accountData["preferences.search_distance"] = accountData.search_distance;

//       delete accountData.search_distance;
//     }
//     if (body.coupon_code) {
//       accountData.coupon_code = body.coupon_code;
//       accountData.deviceId = body.deviceId;
//     }
//     accountData.username = username;
//     accountData.isAppDownloaded = true;
//     if (body.current_city) {
//       accountData.user_city = body.current_city;
//       detailsData.current_city = body.current_city;
//     }
//     let updatedUser;
//     try {
//       updatedUser = await User.findByIdAndUpdate(userId, accountData, {
//         new: true,
//       });
//     } catch (error) {
//       throw new Error(
//         "This email already exists. Please use a different email or write to us at support@jobzi.in"
//       );
//     }

//     const updatedUserDetails = await Applicant.findOneAndUpdate(
//       { userID: userId },
//       detailsData,
//       {
//         new: true,
//       }
//     ).populate({ path: "resume", select: "location" });

//     return {
//       account: updatedUser,
//       details: updatedUserDetails,
//     };
//   };
// }
// module.exports = new UserService();
