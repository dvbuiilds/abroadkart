/**
 *
 * @param name String
 * @returns String that is abbreviation of the name String
 *
 * This method shall be used to generate abbreviation of a name that can be of any number of words.
 */
export const getNameAbbreviation = (name: string): string => {
  return name[0];
  // const words = name.split(" ");
  // let abbreviation = "";
  // words.forEach((word, index) => {
  //   if (index <= 1 && word && word.length) {
  //     abbreviation += word[0].toUpperCase();
  //   }
  // });
  // return abbreviation;
};
