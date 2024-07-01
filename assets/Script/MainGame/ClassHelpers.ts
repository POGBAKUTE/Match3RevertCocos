import { _decorator } from 'cc';
export class CheckerBoolean {
  public static checkTwoBoolean(one, two) {
        return one & two;
  }
  public static checkTrheeBoolean(one, two, trhee) {
        return one & two & trhee;
  }
  public static EqualsTwoObj(one, two) {
        return one === two;
  }
  public static EqualsTrheeObj(one, two, trhee) {
        if (one === two && two === trhee) return true;
        return false;
  }
}


/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// export class CheckerBoolean {
// 
//   public static checkTwoBoolean(one, two) {
//     return one & two;
//   }
// 
//   public static checkTrheeBoolean(one, two, trhee) {
//     return one & two & trhee;
//   }
// 
//   public static EqualsTwoObj(one, two) {
//     return one === two;
//   }
// 
//   public static EqualsTrheeObj(one, two, trhee) {
//     if (one === two && two === trhee) return true;
//     return false;
//   }
// }
