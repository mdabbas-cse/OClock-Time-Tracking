const { json } = require('express');
const dbConnect = require('../config/database');

const AttendanceModel = {

  setAttendanceStart: async (id) => {
    try {
      const sqlStart = 'INSERT INTO `attendance`(`user_id`) VALUES (?)';
      const values = [id]
      const [rows] = await dbConnect.promise().execute(sqlStart, values);
      return rows;
    } catch (err) {
      console.log('====>Error form AttendanceModel/setAttendance', err);
      return err;
    }
  },

  setAttendanceEnd: async (id) => {
    try {
      const sqlEnd = 'UPDATE  attendance SET  end = CURRENT_TIMESTAMP, status = 0 WHERE user_id = ?  AND  status = 1';
      const values = [id]
      const [rows] = await dbConnect.promise().execute(sqlEnd, values);
      return rows;
    } catch (err) {
      console.log('====>Error form AttendanceModel/setAttendance', err);
      return err;
    }
  },
  getStartData: async (userId) => {
    const getStartSql = 'SELECT start FROM `attendance` WHERE user_id =? and status =1'
    const value = [userId]
    const [rows] = await dbConnect.promise().execute(getStartSql, value);
    return rows;
  },
  getWeekHistory: async (userId) => {
    const getWeekHistory = 'SELECT DATE_FORMAT(Date(create_at),"%d %b %y") as date ,Time_format(Time(start),"%H:%i")as start,Time_format(Time(end),"%H:%i") as end, Time_format(timediff(end,start ),"%H:%i:%s") as total FROM attendance WHERE user_id = ?  and date(create_at) BETWEEN date( CURRENT_DATE - INTERVAL 8 day) and date(CURRENT_DATE - INTERVAL 1 day )'
    const value = [userId]
    const [rows] = await dbConnect.promise().execute(getWeekHistory, value);
    return rows;
  },
  getToday: async (userId) => {
    const getTodaySql = 'SELECT  Time(start) as start , Time(end) as end, timediff(end,start ) as total FROM attendance WHERE user_id = ? and status = 0 and Date(create_at)= Date(CURRENT_DATE)'
    const value = [userId]
    const [rows] = await dbConnect.promise().execute(getTodaySql, value);
    return rows;
  },
  todayTotal: async (userId) => {
    const todayTotalSql = 'SELECT TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))) as todayTotal FROM  attendance WHERE user_id = ? and status = 0 and Date(create_at)= Date(CURRENT_DATE)'
    const value = [userId]
    const [rows] = await dbConnect.promise().execute(todayTotalSql, value);
    return rows;
  },
  weekTotal: async (userId) => {
    const weekTotalSql = 'SELECT TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))) as weekTotal FROM attendance WHERE user_id = ? and status = 0 and Date(create_at) BETWEEN date( CURRENT_DATE - INTERVAL 8 day) and date(CURRENT_DATE - INTERVAL 1 day )'
    const value = [userId]
    const [rows] = await dbConnect.promise().execute(weekTotalSql, value);
    return rows;
  },

  // employee average working time Model
  averageWeekWorkTime: async (userId) => {
    const avgWeekTotal = 'SELECT TIME(TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))) / 7) as week_avg FROM attendance WHERE user_id = ?';
    const value = [userId]
    const [rows] = await dbConnect.promise().execute(avgWeekTotal, value)
    return rows;
  },

  // an employee report last 7 days
  anEmployeeReportLastSavenDays: async (userId) => {
    const lastSeventDaysSql = 'SELECT  TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start)))))  AS working_time ,DATE_FORMAT(Date(create_at),"%d %b %y") AS create_date, MIN(TIME(start)) AS start, MAX(TIME(end)) AS end, CASE WHEN  (TIME("06:00:00") > TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start)))))) THEN SUBTIME(TIME("06:00:00"), TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start)))))) WHEN  (TIME("06:00:00") < TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))))  THEN SUBTIME( TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))), TIME("06:00:00")) WHEN  (TIME("06:00:00") = TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))))  THEN "Equle" END AS time_count FROM attendance WHERE user_id = ? and create_at >  now() - INTERVAL 7 day GROUP BY DATE_FORMAT(Date(create_at),"%d %b %y")';
    const value = [userId];
    const [rows] = await dbConnect.promise().execute(lastSeventDaysSql, value);
    return rows;
  },
  // an employee repot berween to date
  anEmployeeReportBetweenTwoDate: async (userId, startDate, endDate) => {
    try {
      const betweenTowDateSql = "SELECT  TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start)))))  AS working_time ,DATE_FORMAT(Date(create_at),'%d %b %y') AS create_date, MIN(TIME(start)) AS start, MAX(TIME(end)) AS end, CASE WHEN  (TIME('06:00:00') > TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start)))))) THEN SUBTIME(TIME('06:00:00'), TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start)))))) WHEN  (TIME('06:00:00') < TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))))  THEN SUBTIME( TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))), TIME('06:00:00')) WHEN  (TIME('06:00:00') = TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start))))))  THEN 'Equle' END AS time_count FROM attendance WHERE user_id = ? AND  DATE(create_at) BETWEEN ? AND  ? GROUP BY DATE_FORMAT(Date(create_at),'%d %b %y')";

      const values = [userId, startDate, endDate];
      const [rows] = await dbConnect.promise().execute(betweenTowDateSql, values);
      return rows;
    } catch (err) {
      console.log('====>Error form AttendanceModel/aEmployeeRportBetweenTwoDate', err);
      return err;
    }
  },
}

module.exports = AttendanceModel;
// SELECT  TIMEDIFF(SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(end)))), SEC_TO_TIME(SUM(TIME_TO_SEC(TIME(start)))))  AS working_time ,DATE_FORMAT(Date(create_at),"%d %b %y") AS create_date, MIN(TIME(start)) AS start, MAX(TIME(end)) AS end  FROM attendance WHERE user_id = ? and create_at >  now() - INTERVAL 7 day GROUP BY DATE_FORMAT(Date(create_at),"%d %b %y")
