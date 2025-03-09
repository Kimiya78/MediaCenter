import moment from "jalali-moment";

const convertToJalali = (dateStr: string) => {
  if (!dateStr || typeof dateStr !== "string") return "Invalid Date";

  try {
    // تبدیل تاریخ ورودی به یک آبجکت moment میلادی
    const gregorianMoment = moment(dateStr, "YYYY/MM/DD - HH:mm");

    // بررسی اعتبار تاریخ
    if (!gregorianMoment.isValid()) return "Invalid Date";

    // تبدیل به تاریخ شمسی و فرمت‌دهی
    return gregorianMoment
      .locale("fa") 
      .format("jYYYY/jMM/jDD - HH:mm"); 

  } catch (error) {
    console.error("Date conversion error:", error);
    return "Invalid Date";
  }
};

export default convertToJalali;
