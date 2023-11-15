import axios from 'axios';

interface UserData {
  user_id: string;
  discord_id: string;
  rank_id: number;
  rank_name: string;
  thumbnail_url: string;
  display_name: string;
  user: string;
  account_creation: string;
  account_age: number;
  account_age_full: string;
}

interface UserRank {
  rank: string | null,
  full_rank: string
}

interface RankData {
  id: number;
  name: string;
  rank: number;
  memberCount: number;
}

interface PromotionError {
  status: boolean;
  message?: string;
}

interface PromotionSuccess {
  status: boolean;
  new?: RankData;
  old?: RankData;
}

type PromotionResult = PromotionSuccess | PromotionError;

export async function getMemberData(userId: string) {
  const groupId = parseInt(process.env.GROUP_ID, 10);
  const guildId = process.env.GUILD_ID;
  const apiToken = process.env.API_TOKEN;
  const baseApiUrl = `https://api.rowifi.xyz/v2/guilds/${guildId}/members`;
  const baseGroupUrl = `https://groups.roblox.com/v2/users`;
  const baseUserUrl = `https://users.roblox.com/v1/users`;
  const res = await axios.get(`${baseApiUrl}/${userId}`, {
    headers: {
      Authorization: `Bot ${apiToken}`
    }
  });

  const userRank = await axios.get(`${baseGroupUrl}/${res.data.roblox_id}/groups/roles`);
  const userData = await axios.get(`${baseUserUrl}/${res.data.roblox_id}`);
  const robloxId = parseInt(res.data.roblox_id);
  const robloxUsername = userData.data.name;
  const accountCreationISO = userData.data.created;
  const creationTime = new Date(accountCreationISO);
  const currentTime = new Date();
  const creationTimeSeconds = Math.floor(creationTime.getTime() / 1000);
  const currentTimeSeconds = Math.floor(currentTime.getTime() / 1000);
  const creationDate = `<t:${creationTimeSeconds}:D> (<t:${creationTimeSeconds}:R>)`;
  const accountAgeDays = Math.floor((currentTimeSeconds - creationTimeSeconds) / 86400);
  const userImageUrl = await getUserAvatar(robloxId);
  const data: UserData = {
    user_id: robloxId.toString(),
    discord_id: userId,
    rank_id: 0,
    rank_name: "",
    thumbnail_url: userImageUrl,
    display_name: userData.data.displayName,
    user: "",
    account_creation: creationDate,
    account_age: accountAgeDays,
    account_age_full: DateFormatter.formatDaysToYearsMonthsDays(accountAgeDays)
  };

  const groupObject = userRank.data.data.find((info: any) => groupId === info.group.id);
  const rankName = groupObject ? groupObject.role.name : "Guest";
  const userRankData = getUserRank(rankName);

  data.user = userRankData.rank ? `[${userRankData.rank}] ${robloxUsername}` : robloxUsername;
  data.rank_id = groupObject ? parseInt(groupObject.role.rank) : 0;
  data.rank_name = userRankData.full_rank;

  return data;
}

class DateFormatter {
  static isLeapYear(year: number): boolean {
    // Leap year is divisible by 4, but not divisible by 100 unless divisible by 400
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  static daysInMonth(year: number, month: number): number {
    const monthLengths = [31, this.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return monthLengths[month];
  }

  static formatDaysToYearsMonthsDays(days: number): string {
    const currentDate: Date = new Date();

    // Calculate the target date by adding the given number of days to the current date
    const targetDate: Date = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);

    let years: number = targetDate.getFullYear() - currentDate.getFullYear();
    let months: number = targetDate.getMonth() - currentDate.getMonth();
    let remainingDays: number = targetDate.getDate() - currentDate.getDate();

    // Adjust negative values
    if (remainingDays < 0) {
      const lastMonthDays = this.daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
      remainingDays += lastMonthDays;
      months -= 1;
    }

    if (months < 0) {
      months += 12;
      years -= 1;
    }

    // Construct the formatted result
    let result: string = "";
    result += years > 0 ? `${years} year${years !== 1 ? 's' : ''} ` : "";
    result += months > 0 ? `${months} month${months !== 1 ? 's' : ''} ` : "";
    result += remainingDays > 0 ? `${remainingDays} day${remainingDays !== 1 ? 's' : ''}` : "";

    return result.trim();
  }
}

async function getUserAvatar(userId: number) {
  const url = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=180x180&format=Png&isCircular=true`;
  const res = await axios.get(url);
  const data = res.data;
  const userObject = data.data.find((info: any) => userId === info.targetId);
  const imageUrl: string = userObject ? userObject.imageUrl : "";

  return imageUrl;
}

function getUserRank(rankName: string) {
  const matches = rankName.match(/^\[(\w+)\] (.+)$/);

  if (matches && matches.length === 3) {
    const [, rank, full_rank ] = matches;
    const userRank: UserRank = {
      rank,
      full_rank
    }

    return userRank;
  } else {
    return {
      rank: null,
      full_rank: rankName
    }
  }
}

async function getUserData(userId: string) {
  const apiToken = process.env.API_TOKEN;
  const guildId = process.env.GUILD_ID;
  const baseApiUrl = `https://api.rowifi.xyz/v2/guilds/${guildId}/members`;
  const res = await axios.get(`${baseApiUrl}/${userId}`, {
    headers: {
      Authorization: `Bot ${apiToken}`
    }
  });

  return res.data;
}

export async function promoteUser(userId: string) {
  const guildId = process.env.GUILD_ID;
  const groupId = parseInt(process.env.GROUP_ID, 10);
  const apiToken = process.env.API_TOKEN;
  const robloxData = await getUserData(userId);
  const robloxId = parseInt(robloxData.roblox_id);
  const baseApiUrl = `https://api.rowifi.xyz/v2/guilds/${guildId}/setrank`;
  const baseGroupUrl = `https://groups.roblox.com/v2/users`;
  const baseGroupUri = `https://groups.roblox.com/v1/groups/${groupId}/roles`;
  const userRank = await axios.get(`${baseGroupUrl}/${robloxId}/groups/roles`);
  const allRanksData = await axios.get(baseGroupUri);
  const groupObject = userRank.data.data.find((info: any) => groupId === info.group.id);
  const rankId = groupObject ? parseInt(groupObject.role.rank) : 0;
  const allRanks = allRanksData.data.roles;
  const oldRank = groupObject.role;

  let found: RankData | string | null = null;
  for (let i = 0; i < allRanks.length; i++) {
    const role = allRanks[i];
    const thisRankId = role.rank;

    if (thisRankId === rankId) {
      const change = (i < allRanks.length - 1) ? i + 1 : null;
      if (change !== null) {
        found = (change !== null) ? allRanks[change] : null;
      } else {
        found = `You are already at the highest position`;
      }
      break;
    }
  }

  if (found === null) {
    const err: PromotionResult = {
      status: false,
      message: 'Rank is not found'
    };

    return err;
  }

  if (typeof(found) !== 'string') {
    found['name'] = getUserRank(found.name).full_rank;
    oldRank['name'] = getUserRank(oldRank.name).full_rank;
    const data: RankData = found;
    const oldData: RankData = oldRank;
    const res: PromotionResult = {
      status: true,
      new: data,
      old: oldData
    }
    return res;
  } else {
    const err: PromotionResult = {
      status: false,
      message: found
    }

    return err;
  }

  // const res = await axios.post(baseApiUrl, {
  //   user_id: robloxId,
  //   group_id: parseInt(groupId),
  //   rank_id:
  // }, {
  //     headers: {
  //       'Authorization': `Bot ${apiToken}`
  //     }
  //   })
}
