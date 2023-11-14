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
