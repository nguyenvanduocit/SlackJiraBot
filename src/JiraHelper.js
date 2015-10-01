class JiraHelper{
    /**
     * translate color from adg to RGB
     * @param adg string
     * @returns string
     * @constructor
     */
    static ADG2RGB(adg){
        switch (adg){
            case 'medium-gray':
                return '#707070';
            case 'green':
                return '#14892c';
            case 'yellow':
                return '#f6c342';
            case 'red':
                return '#d04437';
            case 'navy':
                return '#205081';
            case 'light-gray':
                return '#f5f5f5';
            case 'charcoal':
                return '#333333';
            case 'blue':
                return '#3572b0';
            case 'brown':
                return '#815b3a';
            case 'silver':
                return '#e9e9e9';
            case 'warm-red':
                return '#d04437';
            case 'blue-gray':
                return '#6699CC';
        }
    }

    /**
     * get color for priority
     * @param priority string
     * @returns string
     */
    static getPriorityColor(priority){
        switch (priority){
            case '1':
                return '#cc0000';
            case '2':
                return '#ff0000';
            case '3':
                return '#009900';
            case '4':
                return '#006600';
            case '5':
                return '#003300';
        }
    }
}
module.exports = JiraHelper;