import GObject from "gi://GObject";
import GLib from "gi://GLib";
import Adw from "gi://Adw";
import Gio from "gi://Gio";

export const PomodoroWindow = GObject.registerClass(
  {
    GTypeName: "PomodoroWindow",
    Template: "resource:///org/gnome/Example/window.ui",
    InternalChildren: ["label", "start_button", "reset_button", "toast_overlay"],
  },
  class PomodoroWindow extends Adw.ApplicationWindow {
    constructor(application) {
      super({ application });

      this.label = this.get_template_child(PomodoroWindow, "label");
      this.start_button = this.get_template_child(
        PomodoroWindow,
        "start_button"
      );
      this.reset_button = this.get_template_child(
        PomodoroWindow,
        "reset_button"
      );
      this.toast_overlay = this.get_template_child(PomodoroWindow, "toast_overlay")

      this.workDuration = 0.05 * 60;
      this.timeLeft = this.workDuration;
      this.timer = null;

      this.updateLabel();

      this.start_button.connect("clicked", () => this.startTimer());
      this.reset_button.connect("clicked", () => this.resetTimer());
    }

    updateLabel() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      this.label.set_label(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`
      );
    }

    startTimer() {
      const toast = new Adw.Toast({
        title: "Timer has been started",
        timeout: 5,
      });

      this.toast_overlay.add_toast(toast);

      if (this.timer) {
        GLib.source_remove(this.timer);
        this.timer = null;
        return;
      }

      this.timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () =>
        this.tick()
      );
    }

    tick() {
      // When timer has finished
      if (this.timeLeft <= 0) {
        GLib.source_remove(this.timer);
        this.timer = null;

        this.showNotification();
        return false;
      }

      this.timeLeft--;
      this.updateLabel();
      return true;
    }

    resetTimer() {
      if (this.timer) {
        GLib.source_remove(this.timer);
        this.timer = null;
      }

      this.timeLeft = this.workDuration;
      this.updateLabel();
    }

    showNotification() {
      let notification = new Gio.Notification();

      notification.set_title("Pomodoro Timer");
      notification.set_body("Your pomodoro session has ended");

      // const iconFile = Gio.File.new_for_path("path/icon.png");
      // const icon = new Gio.FileIcon({ file });
      // notification.set_icon(icon);

      // notification.add_button("Start New Pomodoro", "app.start-new-pomodoro");

      this.get_application().send_notification("pomodoro-ended", notification);
    }
  }
);
