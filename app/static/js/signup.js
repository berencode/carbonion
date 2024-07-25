
function main() {
  const signup_manager = new SignupManager();
}



export class SignupManager{
    constructor(){
      this.mail = document.querySelector("#mail");
      this.passwordConfirmation = document.querySelector('#password-confirmation');
      this.password = document.querySelector('#password');
      this.button = document.querySelector('#signup-button')
      this.activateCheckMail();
      this.activateCheckPasswords();
      this.stateMailCorrect = false;
      this.statePasswordMatch = false;
      this.statePasswordVerified = false;
    }

    isValidEmail(email) {
        // Regular expression for validating email addresses
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    verifyMail(){
        // Vérification que les 
        var container = document.querySelector('#mail-status-container');
        var status_mail = document.querySelector('#check-item-mail');
        var value = this.mail.value;
        // Validate lowercase letters
        if(this.isValidEmail(value)) { 
            container.classList.remove("show");
            container.classList.add("hide"); 
            status_mail.classList.remove("invalid");
            status_mail.classList.add("valid");
            this.stateMailCorrect = true;

        } else {
            container.classList.remove("hide");
            container.classList.add("show"); 
            status_mail.classList.remove("valid");
            status_mail.classList.add("invalid");
            this.stateMailCorrect = false;
        }

        console.log(this.stateMailCorrect)

        // on met à jour le bouton valider au besoin : 
        this.updateButtonState()

    }

    verifyPassword(){
        var container = document.querySelector('#password-status-container')
        var letter = document.querySelector('#check-item-letter');
        var capital = document.querySelector('#check-item-capital');
        var number = document.querySelector('#check-item-number');
        var length = document.querySelector('#check-item-length');
        var value = this.password.value;
        var errorCount = 0;

        // Validate lowercase letters
        var lowerCaseLetters = /[a-z]/g;
        if(value.match(lowerCaseLetters)) {  
            letter.classList.remove("invalid");
            letter.classList.add("valid");
        } else {
            letter.classList.remove("valid");
            letter.classList.add("invalid");
            errorCount += 1;
        }
        
        // Validate capital letters
        var upperCaseLetters = /[A-Z]/g;
        if(value.match(upperCaseLetters)) {  
            capital.classList.remove("invalid");
            capital.classList.add("valid");
        } else {
            capital.classList.remove("valid");
            capital.classList.add("invalid");
            errorCount += 1;
        }

        // Validate numbers
        var numbers = /[0-9]/g;
        if(value.match(numbers)) {  
            number.classList.remove("invalid");
            number.classList.add("valid");
        } else {
            number.classList.remove("valid");
            number.classList.add("invalid");
            errorCount += 1;
        }
        
        // Validate length
        if(value.length >= 8) {
            length.classList.remove("invalid");
            length.classList.add("valid");
        } else {
            length.classList.remove("valid");
            length.classList.add("invalid");
            errorCount += 1;
        }

        if(errorCount == 0){
            container.classList.remove("show");
            container.classList.add("hide");
            this.statePasswordVerified = true;
        }
        else{
            container.classList.remove("hide");
            container.classList.add("show");
            this.statePasswordVerified = false;
        }
        console.log("error!count", errorCount)
        // on met à jour le bouton valider au besoin : 
        this.updateButtonState()
        
    }
    activateCheckMail(){
        this.mail.addEventListener(
            "input",
            this.verifyMail.bind(this)
        )
    }
    activateCheckPasswords(){
        this.password.addEventListener(
            "input",
            this.verifyPassword.bind(this)
        )
        this.password.addEventListener(
            "input",
            this.checkPasswords.bind(this)
        )
        this.passwordConfirmation.addEventListener(
            "input",
            this.checkPasswords.bind(this)
        )

    }

    checkPasswords(){
        var container = document.querySelector('#password-confirmation-status-container')
        var valuePassword = this.password.value;
        var valuePasswordConfirmation = this.passwordConfirmation.value;
        if(valuePassword == valuePasswordConfirmation){
            container.classList.remove("show");
            container.classList.add("hide");
            this.statePasswordMatch = true;
        }
        else{
            container.classList.remove("hide");
            container.classList.add("show");
            this.statePasswordMatch = false;
        }

        // on met à jour le bouton valider au besoin : 
        this.updateButtonState()

    }

    updateButtonState(){
        
        if(this.stateMailCorrect && this.statePasswordMatch && this.statePasswordVerified){
            this.button.disabled = false;
        }
        else{
            this.button.disabled = true;
        }
    }




}

main();