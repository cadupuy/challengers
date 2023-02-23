export default class Motion {

  constructor(_index) {
    this.ui = new UI();
    this.index = _index;
    this.audio;
  }

  start() {
    if(this.index >= 1 && this.index < 4) {
      this.ui.wrapper_elt.classList.add('active');
      this.startAnimation();
      this.startAudio();
    }
  }

  resetAnimations() {
    for(let motion of this.ui.wrapper_elt.querySelectorAll('.motion')) {
      motion.classList.remove('active');
    }
  }

  startAnimation() {
    this.resetAnimations();
    this.ui.theater_elt.querySelector(`.motion-${this.motion}`).classList.add('active');
  }

  stopMotion() {
    this.ui.wrapper_elt.classList.remove('active');
    this.stopAudio();
    this.stopSubtitles();
  }

  startAudio() { 
    this.audio = this.ui.audios[this.motion-1];
    if(!this.audio_playing) {
      this.playMotionAudio();
      this.startSubtitles();
    }
  }

}
