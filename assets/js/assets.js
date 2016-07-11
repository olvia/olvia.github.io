/*$(function() {

    $("input,textarea").jqBootstrapValidation({
        preventSubmit: true,
        submitError: function($form, event, errors) {
            // additional error messages or events
        },
        submitSuccess: function($form, event) {
            event.preventDefault(); // prevent default submit behaviour
            // get values from FORM
            var name = $("input#name").val();
            var email = $("input#email").val();
            var message = $("textarea#message").val();
            var firstName = name; // For Success/Failure Message
            // Check for white space in name for Success/Fail message
            if (firstName.indexOf(' ') >= 0) {
                firstName = name.split(' ').slice(0, -1).join(' ');
            }
            $.ajax({
                url: "assets/php/mail/contact_me.php",
                type: "POST",
                data: {
                    name: name,
                    email: email,
                    message: message
                },
                cache: false,
                success: function() {
                    // Success message
                    $('#success').html("<div class='alert alert-success'>");
                    $('#success > .alert-success').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-success')
                        .append("<strong>Ваше сообщение отправлено</strong>");
                    $('#success > .alert-success')
                        .append('</div>');

                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
                error: function() {
                    // Fail message
                    $('#success').html("<div class='alert alert-danger'>");
                    $('#success > .alert-danger').html("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;")
                        .append("</button>");
                    $('#success > .alert-danger').append("<strong>Sorry " + firstName + ", кажется, сервер не отвечает. Попробуйте еще раз!");
                    $('#success > .alert-danger').append('</div>');
                    //clear all fields
                    $('#contactForm').trigger("reset");
                },
            })
        },
        filter: function() {
            return $(this).is(":visible");
        },
    });

    $("a[data-toggle=\"tab\"]").click(function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
});


$('#name').focus(function() {
    $('#success').html('');
});
*/
/* jqBootstrapValidation
 * A plugin for automating validation on Twitter Bootstrap formatted forms.
 *
 * v1.3.6
 *
 * License: MIT <http://opensource.org/licenses/mit-license.php> - see LICENSE file
 *
 * http://ReactiveRaven.github.com/jqBootstrapValidation/
 */

(function( $ ){

	var createdElements = [];

	var defaults = {
		options: {
			prependExistingHelpBlock: false,
			sniffHtml: true, // sniff for 'required', 'maxlength', etc
			preventSubmit: true, // stop the form submit event from firing if validation fails
			submitError: false, // function called if there is an error when trying to submit
			submitSuccess: false, // function called just before a successful submit event is sent to the server
            semanticallyStrict: false, // set to true to tidy up generated HTML output
			autoAdd: {
				helpBlocks: true
			},
            filter: function () {
                // return $(this).is(":visible"); // only validate elements you can see
                return true; // validate everything
            }
		},
    methods: {
      init : function( options ) {

        var settings = $.extend(true, {}, defaults);

        settings.options = $.extend(true, settings.options, options);

        var $siblingElements = this;

        var uniqueForms = $.unique(
          $siblingElements.map( function () {
            return $(this).parents("form")[0];
          }).toArray()
        );

        $(uniqueForms).bind("submit", function (e) {
          var $form = $(this);
          var warningsFound = 0;
          var $inputs = $form.find("input,textarea,select").not("[type=submit],[type=image]").filter(settings.options.filter);
          $inputs.trigger("submit.validation").trigger("validationLostFocus.validation");

          $inputs.each(function (i, el) {
            var $this = $(el),
              $controlGroup = $this.parents(".form-group").first();
            if (
              $controlGroup.hasClass("warning")
            ) {
              $controlGroup.removeClass("warning").addClass("error");
              warningsFound++;
            }
          });

          $inputs.trigger("validationLostFocus.validation");

          if (warningsFound) {
            if (settings.options.preventSubmit) {
              e.preventDefault();
            }
            $form.addClass("error");
            if ($.isFunction(settings.options.submitError)) {
              settings.options.submitError($form, e, $inputs.jqBootstrapValidation("collectErrors", true));
            }
          } else {
            $form.removeClass("error");
            if ($.isFunction(settings.options.submitSuccess)) {
              settings.options.submitSuccess($form, e);
            }
          }
        });

        return this.each(function(){

          // Get references to everything we're interested in
          var $this = $(this),
            $controlGroup = $this.parents(".form-group").first(),
            $helpBlock = $controlGroup.find(".help-block").first(),
            $form = $this.parents("form").first(),
            validatorNames = [];

          // create message container if not exists
          if (!$helpBlock.length && settings.options.autoAdd && settings.options.autoAdd.helpBlocks) {
              $helpBlock = $('<div class="help-block" />');
              $controlGroup.find('.controls').append($helpBlock);
							createdElements.push($helpBlock[0]);
          }

          // =============================================================
          //                                     SNIFF HTML FOR VALIDATORS
          // =============================================================

          // *snort sniff snuffle*

          if (settings.options.sniffHtml) {
            var message = "";
            // ---------------------------------------------------------
            //                                                   PATTERN
            // ---------------------------------------------------------
            if ($this.attr("pattern") !== undefined) {
              message = "Not in the expected format<!-- data-validation-pattern-message to override -->";
              if ($this.data("validationPatternMessage")) {
                message = $this.data("validationPatternMessage");
              }
              $this.data("validationPatternMessage", message);
              $this.data("validationPatternRegex", $this.attr("pattern"));
            }
            // ---------------------------------------------------------
            //                                                       MAX
            // ---------------------------------------------------------
            if ($this.attr("max") !== undefined || $this.attr("aria-valuemax") !== undefined) {
              var max = ($this.attr("max") !== undefined ? $this.attr("max") : $this.attr("aria-valuemax"));
              message = "Too high: Maximum of '" + max + "'<!-- data-validation-max-message to override -->";
              if ($this.data("validationMaxMessage")) {
                message = $this.data("validationMaxMessage");
              }
              $this.data("validationMaxMessage", message);
              $this.data("validationMaxMax", max);
            }
            // ---------------------------------------------------------
            //                                                       MIN
            // ---------------------------------------------------------
            if ($this.attr("min") !== undefined || $this.attr("aria-valuemin") !== undefined) {
              var min = ($this.attr("min") !== undefined ? $this.attr("min") : $this.attr("aria-valuemin"));
              message = "Too low: Minimum of '" + min + "'<!-- data-validation-min-message to override -->";
              if ($this.data("validationMinMessage")) {
                message = $this.data("validationMinMessage");
              }
              $this.data("validationMinMessage", message);
              $this.data("validationMinMin", min);
            }
            // ---------------------------------------------------------
            //                                                 MAXLENGTH
            // ---------------------------------------------------------
            if ($this.attr("maxlength") !== undefined) {
              message = "Too long: Maximum of '" + $this.attr("maxlength") + "' characters<!-- data-validation-maxlength-message to override -->";
              if ($this.data("validationMaxlengthMessage")) {
                message = $this.data("validationMaxlengthMessage");
              }
              $this.data("validationMaxlengthMessage", message);
              $this.data("validationMaxlengthMaxlength", $this.attr("maxlength"));
            }
            // ---------------------------------------------------------
            //                                                 MINLENGTH
            // ---------------------------------------------------------
            if ($this.attr("minlength") !== undefined) {
              message = "Too short: Minimum of '" + $this.attr("minlength") + "' characters<!-- data-validation-minlength-message to override -->";
              if ($this.data("validationMinlengthMessage")) {
                message = $this.data("validationMinlengthMessage");
              }
              $this.data("validationMinlengthMessage", message);
              $this.data("validationMinlengthMinlength", $this.attr("minlength"));
            }
            // ---------------------------------------------------------
            //                                                  REQUIRED
            // ---------------------------------------------------------
            if ($this.attr("required") !== undefined || $this.attr("aria-required") !== undefined) {
              message = settings.builtInValidators.required.message;
              if ($this.data("validationRequiredMessage")) {
                message = $this.data("validationRequiredMessage");
              }
              $this.data("validationRequiredMessage", message);
            }
            // ---------------------------------------------------------
            //                                                    NUMBER
            // ---------------------------------------------------------
            if ($this.attr("type") !== undefined && $this.attr("type").toLowerCase() === "number") {
              message = settings.builtInValidators.number.message;
              if ($this.data("validationNumberMessage")) {
                message = $this.data("validationNumberMessage");
              }
              $this.data("validationNumberMessage", message);
            }
            // ---------------------------------------------------------
            //                                                     EMAIL
            // ---------------------------------------------------------
            if ($this.attr("type") !== undefined && $this.attr("type").toLowerCase() === "email") {
              message = "Неправильный email адрес<!-- data-validator-validemail-message to override -->";
              if ($this.data("validationValidemailMessage")) {
                message = $this.data("validationValidemailMessage");
              } else if ($this.data("validationEmailMessage")) {
                message = $this.data("validationEmailMessage");
              }
              $this.data("validationValidemailMessage", message);
            }
            // ---------------------------------------------------------
            //                                                MINCHECKED
            // ---------------------------------------------------------
            if ($this.attr("minchecked") !== undefined) {
              message = "Not enough options checked; Minimum of '" + $this.attr("minchecked") + "' required<!-- data-validation-minchecked-message to override -->";
              if ($this.data("validationMincheckedMessage")) {
                message = $this.data("validationMincheckedMessage");
              }
              $this.data("validationMincheckedMessage", message);
              $this.data("validationMincheckedMinchecked", $this.attr("minchecked"));
            }
            // ---------------------------------------------------------
            //                                                MAXCHECKED
            // ---------------------------------------------------------
            if ($this.attr("maxchecked") !== undefined) {
              message = "Too many options checked; Maximum of '" + $this.attr("maxchecked") + "' required<!-- data-validation-maxchecked-message to override -->";
              if ($this.data("validationMaxcheckedMessage")) {
                message = $this.data("validationMaxcheckedMessage");
              }
              $this.data("validationMaxcheckedMessage", message);
              $this.data("validationMaxcheckedMaxchecked", $this.attr("maxchecked"));
            }
          }

          // =============================================================
          //                                       COLLECT VALIDATOR NAMES
          // =============================================================

          // Get named validators
          if ($this.data("validation") !== undefined) {
            validatorNames = $this.data("validation").split(",");
          }

          // Get extra ones defined on the element's data attributes
          $.each($this.data(), function (i, el) {
            var parts = i.replace(/([A-Z])/g, ",$1").split(",");
            if (parts[0] === "validation" && parts[1]) {
              validatorNames.push(parts[1]);
            }
          });

          // =============================================================
          //                                     NORMALISE VALIDATOR NAMES
          // =============================================================

          var validatorNamesToInspect = validatorNames;
          var newValidatorNamesToInspect = [];

          do // repeatedly expand 'shortcut' validators into their real validators
          {
            // Uppercase only the first letter of each name
            $.each(validatorNames, function (i, el) {
              validatorNames[i] = formatValidatorName(el);
            });

            // Remove duplicate validator names
            validatorNames = $.unique(validatorNames);

            // Pull out the new validator names from each shortcut
            newValidatorNamesToInspect = [];
            $.each(validatorNamesToInspect, function(i, el) {
              if ($this.data("validation" + el + "Shortcut") !== undefined) {
                // Are these custom validators?
                // Pull them out!
                $.each($this.data("validation" + el + "Shortcut").split(","), function(i2, el2) {
                  newValidatorNamesToInspect.push(el2);
                });
              } else if (settings.builtInValidators[el.toLowerCase()]) {
                // Is this a recognised built-in?
                // Pull it out!
                var validator = settings.builtInValidators[el.toLowerCase()];
                if (validator.type.toLowerCase() === "shortcut") {
                  $.each(validator.shortcut.split(","), function (i, el) {
                    el = formatValidatorName(el);
                    newValidatorNamesToInspect.push(el);
                    validatorNames.push(el);
                  });
                }
              }
            });

            validatorNamesToInspect = newValidatorNamesToInspect;

          } while (validatorNamesToInspect.length > 0)

          // =============================================================
          //                                       SET UP VALIDATOR ARRAYS
          // =============================================================

          var validators = {};

          $.each(validatorNames, function (i, el) {
            // Set up the 'override' message
            var message = $this.data("validation" + el + "Message");
            var hasOverrideMessage = (message !== undefined);
            var foundValidator = false;
            message =
              (
                message
                  ? message
                  : "'" + el + "' validation failed <!-- Add attribute 'data-validation-" + el.toLowerCase() + "-message' to input to change this message -->"
              )
            ;

            $.each(
              settings.validatorTypes,
              function (validatorType, validatorTemplate) {
                if (validators[validatorType] === undefined) {
                  validators[validatorType] = [];
                }
                if (!foundValidator && $this.data("validation" + el + formatValidatorName(validatorTemplate.name)) !== undefined) {
                  validators[validatorType].push(
                    $.extend(
                      true,
                      {
                        name: formatValidatorName(validatorTemplate.name),
                        message: message
                      },
                      validatorTemplate.init($this, el)
                    )
                  );
                  foundValidator = true;
                }
              }
            );

            if (!foundValidator && settings.builtInValidators[el.toLowerCase()]) {

              var validator = $.extend(true, {}, settings.builtInValidators[el.toLowerCase()]);
              if (hasOverrideMessage) {
                validator.message = message;
              }
              var validatorType = validator.type.toLowerCase();

              if (validatorType === "shortcut") {
                foundValidator = true;
              } else {
                $.each(
                  settings.validatorTypes,
                  function (validatorTemplateType, validatorTemplate) {
                    if (validators[validatorTemplateType] === undefined) {
                      validators[validatorTemplateType] = [];
                    }
                    if (!foundValidator && validatorType === validatorTemplateType.toLowerCase()) {
                      $this.data("validation" + el + formatValidatorName(validatorTemplate.name), validator[validatorTemplate.name.toLowerCase()]);
                      validators[validatorType].push(
                        $.extend(
                          validator,
                          validatorTemplate.init($this, el)
                        )
                      );
                      foundValidator = true;
                    }
                  }
                );
              }
            }

            if (! foundValidator) {
              $.error("Cannot find validation info for '" + el + "'");
            }
          });

          // =============================================================
          //                                         STORE FALLBACK VALUES
          // =============================================================

          $helpBlock.data(
            "original-contents",
            (
              $helpBlock.data("original-contents")
                ? $helpBlock.data("original-contents")
                : $helpBlock.html()
            )
          );

          $helpBlock.data(
            "original-role",
            (
              $helpBlock.data("original-role")
                ? $helpBlock.data("original-role")
                : $helpBlock.attr("role")
            )
          );

          $controlGroup.data(
            "original-classes",
            (
              $controlGroup.data("original-clases")
                ? $controlGroup.data("original-classes")
                : $controlGroup.attr("class")
            )
          );

          $this.data(
            "original-aria-invalid",
            (
              $this.data("original-aria-invalid")
                ? $this.data("original-aria-invalid")
                : $this.attr("aria-invalid")
            )
          );

          // =============================================================
          //                                                    VALIDATION
          // =============================================================

          $this.bind(
            "validation.validation",
            function (event, params) {

              var value = getValue($this);

              // Get a list of the errors to apply
              var errorsFound = [];

              $.each(validators, function (validatorType, validatorTypeArray) {
                if (value || value.length || (params && params.includeEmpty) || (!!settings.validatorTypes[validatorType].blockSubmit && params && !!params.submitting)) {
                  $.each(validatorTypeArray, function (i, validator) {
                    if (settings.validatorTypes[validatorType].validate($this, value, validator)) {
                      errorsFound.push(validator.message);
                    }
                  });
                }
              });

              return errorsFound;
            }
          );

          $this.bind(
            "getValidators.validation",
            function () {
              return validators;
            }
          );

          // =============================================================
          //                                             WATCH FOR CHANGES
          // =============================================================
          $this.bind(
            "submit.validation",
            function () {
              return $this.triggerHandler("change.validation", {submitting: true});
            }
          );
          $this.bind(
            [
              "keyup",
              "focus",
              "blur",
              "click",
              "keydown",
              "keypress",
              "change"
            ].join(".validation ") + ".validation",
            function (e, params) {

              var value = getValue($this);

              var errorsFound = [];

              $controlGroup.find("input,textarea,select").each(function (i, el) {
                var oldCount = errorsFound.length;
                $.each($(el).triggerHandler("validation.validation", params), function (j, message) {
                  errorsFound.push(message);
                });
                if (errorsFound.length > oldCount) {
                  $(el).attr("aria-invalid", "true");
                } else {
                  var original = $this.data("original-aria-invalid");
                  $(el).attr("aria-invalid", (original !== undefined ? original : false));
                }
              });

              $form.find("input,select,textarea").not($this).not("[name=\"" + $this.attr("name") + "\"]").trigger("validationLostFocus.validation");

              errorsFound = $.unique(errorsFound.sort());

              // Were there any errors?
              if (errorsFound.length) {
                // Better flag it up as a warning.
                $controlGroup.removeClass("success error").addClass("warning");

                // How many errors did we find?
                if (settings.options.semanticallyStrict && errorsFound.length === 1) {
                  // Only one? Being strict? Just output it.
                  $helpBlock.html(errorsFound[0] + 
                    ( settings.options.prependExistingHelpBlock ? $helpBlock.data("original-contents") : "" ));
                } else {
                  // Multiple? Being sloppy? Glue them together into an UL.
                  $helpBlock.html("<ul role=\"alert\"><li>" + errorsFound.join("</li><li>") + "</li></ul>" +
                    ( settings.options.prependExistingHelpBlock ? $helpBlock.data("original-contents") : "" ));
                }
              } else {
                $controlGroup.removeClass("warning error success");
                if (value.length > 0) {
                  $controlGroup.addClass("success");
                }
                $helpBlock.html($helpBlock.data("original-contents"));
              }

              if (e.type === "blur") {
                $controlGroup.removeClass("success");
              }
            }
          );
          $this.bind("validationLostFocus.validation", function () {
            $controlGroup.removeClass("success");
          });
        });
      },
      destroy : function( ) {

        return this.each(
          function() {

            var
              $this = $(this),
              $controlGroup = $this.parents(".form-group").first(),
              $helpBlock = $controlGroup.find(".help-block").first();

            // remove our events
            $this.unbind('.validation'); // events are namespaced.
            // reset help text
            $helpBlock.html($helpBlock.data("original-contents"));
            // reset classes
            $controlGroup.attr("class", $controlGroup.data("original-classes"));
            // reset aria
            $this.attr("aria-invalid", $this.data("original-aria-invalid"));
            // reset role
            $helpBlock.attr("role", $this.data("original-role"));
						// remove all elements we created
						if (createdElements.indexOf($helpBlock[0]) > -1) {
							$helpBlock.remove();
						}

          }
        );

      },
      collectErrors : function(includeEmpty) {

        var errorMessages = {};
        this.each(function (i, el) {
          var $el = $(el);
          var name = $el.attr("name");
          var errors = $el.triggerHandler("validation.validation", {includeEmpty: true});
          errorMessages[name] = $.extend(true, errors, errorMessages[name]);
        });

        $.each(errorMessages, function (i, el) {
          if (el.length === 0) {
            delete errorMessages[i];
          }
        });

        return errorMessages;

      },
      hasErrors: function() {

        var errorMessages = [];

        this.each(function (i, el) {
          errorMessages = errorMessages.concat(
            $(el).triggerHandler("getValidators.validation") ? $(el).triggerHandler("validation.validation", {submitting: true}) : []
          );
        });

        return (errorMessages.length > 0);
      },
      override : function (newDefaults) {
        defaults = $.extend(true, defaults, newDefaults);
      }
    },
		validatorTypes: {
      callback: {
        name: "callback",
        init: function ($this, name) {
          return {
            validatorName: name,
            callback: $this.data("validation" + name + "Callback"),
            lastValue: $this.val(),
            lastValid: true,
            lastFinished: true
          };
        },
        validate: function ($this, value, validator) {
          if (validator.lastValue === value && validator.lastFinished) {
            return !validator.lastValid;
          }

          if (validator.lastFinished === true)
          {
            validator.lastValue = value;
            validator.lastValid = true;
            validator.lastFinished = false;

            var rrjqbvValidator = validator;
            var rrjqbvThis = $this;
            executeFunctionByName(
              validator.callback,
              window,
              $this,
              value,
              function (data) {
                if (rrjqbvValidator.lastValue === data.value) {
                  rrjqbvValidator.lastValid = data.valid;
                  if (data.message) {
                    rrjqbvValidator.message = data.message;
                  }
                  rrjqbvValidator.lastFinished = true;
                  rrjqbvThis.data("validation" + rrjqbvValidator.validatorName + "Message", rrjqbvValidator.message);
                  // Timeout is set to avoid problems with the events being considered 'already fired'
                  setTimeout(function () {
                    rrjqbvThis.trigger("change.validation");
                  }, 1); // doesn't need a long timeout, just long enough for the event bubble to burst
                }
              }
            );
          }

          return false;

        }
      },
      ajax: {
        name: "ajax",
        init: function ($this, name) {
          return {
            validatorName: name,
            url: $this.data("validation" + name + "Ajax"),
            lastValue: $this.val(),
            lastValid: true,
            lastFinished: true
          };
        },
        validate: function ($this, value, validator) {
          if (""+validator.lastValue === ""+value && validator.lastFinished === true) {
            return validator.lastValid === false;
          }

          if (validator.lastFinished === true)
          {
            validator.lastValue = value;
            validator.lastValid = true;
            validator.lastFinished = false;
            $.ajax({
              url: validator.url,
              data: "value=" + value + "&field=" + $this.attr("name"),
              dataType: "json",
              success: function (data) {
                if (""+validator.lastValue === ""+data.value) {
                  validator.lastValid = !!(data.valid);
                  if (data.message) {
                    validator.message = data.message;
                  }
                  validator.lastFinished = true;
                  $this.data("validation" + validator.validatorName + "Message", validator.message);
                  // Timeout is set to avoid problems with the events being considered 'already fired'
                  setTimeout(function () {
                    $this.trigger("change.validation");
                  }, 1); // doesn't need a long timeout, just long enough for the event bubble to burst
                }
              },
              failure: function () {
                validator.lastValid = true;
                validator.message = "ajax call failed";
                validator.lastFinished = true;
                $this.data("validation" + validator.validatorName + "Message", validator.message);
                // Timeout is set to avoid problems with the events being considered 'already fired'
                setTimeout(function () {
                  $this.trigger("change.validation");
                }, 1); // doesn't need a long timeout, just long enough for the event bubble to burst
              }
            });
          }

          return false;

        }
      },
			regex: {
				name: "regex",
				init: function ($this, name) {
					return {regex: regexFromString($this.data("validation" + name + "Regex"))};
				},
				validate: function ($this, value, validator) {
					return (!validator.regex.test(value) && ! validator.negative)
						|| (validator.regex.test(value) && validator.negative);
				}
			},
			required: {
				name: "required",
				init: function ($this, name) {
					return {};
				},
				validate: function ($this, value, validator) {
					return !!(value.length === 0  && ! validator.negative)
						|| !!(value.length > 0 && validator.negative);
				},
        blockSubmit: true
			},
			match: {
				name: "match",
				init: function ($this, name) {
					var element = $this.parents("form").first().find("[name=\"" + $this.data("validation" + name + "Match") + "\"]").first();
					element.bind("validation.validation", function () {
						$this.trigger("change.validation", {submitting: true});
					});
					return {"element": element};
				},
				validate: function ($this, value, validator) {
					return (value !== validator.element.val() && ! validator.negative)
						|| (value === validator.element.val() && validator.negative);
				},
        blockSubmit: true
			},
			max: {
				name: "max",
				init: function ($this, name) {
					return {max: $this.data("validation" + name + "Max")};
				},
				validate: function ($this, value, validator) {
					return (parseFloat(value, 10) > parseFloat(validator.max, 10) && ! validator.negative)
						|| (parseFloat(value, 10) <= parseFloat(validator.max, 10) && validator.negative);
				}
			},
			min: {
				name: "min",
				init: function ($this, name) {
					return {min: $this.data("validation" + name + "Min")};
				},
				validate: function ($this, value, validator) {
					return (parseFloat(value) < parseFloat(validator.min) && ! validator.negative)
						|| (parseFloat(value) >= parseFloat(validator.min) && validator.negative);
				}
			},
			maxlength: {
				name: "maxlength",
				init: function ($this, name) {
					return {maxlength: $this.data("validation" + name + "Maxlength")};
				},
				validate: function ($this, value, validator) {
					return ((value.length > validator.maxlength) && ! validator.negative)
						|| ((value.length <= validator.maxlength) && validator.negative);
				}
			},
			minlength: {
				name: "minlength",
				init: function ($this, name) {
					return {minlength: $this.data("validation" + name + "Minlength")};
				},
				validate: function ($this, value, validator) {
					return ((value.length < validator.minlength) && ! validator.negative)
						|| ((value.length >= validator.minlength) && validator.negative);
				}
			},
			maxchecked: {
				name: "maxchecked",
				init: function ($this, name) {
					var elements = $this.parents("form").first().find("[name=\"" + $this.attr("name") + "\"]");
					elements.bind("click.validation", function () {
						$this.trigger("change.validation", {includeEmpty: true});
					});
					return {maxchecked: $this.data("validation" + name + "Maxchecked"), elements: elements};
				},
				validate: function ($this, value, validator) {
					return (validator.elements.filter(":checked").length > validator.maxchecked && ! validator.negative)
						|| (validator.elements.filter(":checked").length <= validator.maxchecked && validator.negative);
				},
        blockSubmit: true
			},
			minchecked: {
				name: "minchecked",
				init: function ($this, name) {
					var elements = $this.parents("form").first().find("[name=\"" + $this.attr("name") + "\"]");
					elements.bind("click.validation", function () {
						$this.trigger("change.validation", {includeEmpty: true});
					});
					return {minchecked: $this.data("validation" + name + "Minchecked"), elements: elements};
				},
				validate: function ($this, value, validator) {
					return (validator.elements.filter(":checked").length < validator.minchecked && ! validator.negative)
						|| (validator.elements.filter(":checked").length >= validator.minchecked && validator.negative);
				},
        blockSubmit: true
			}
		},
		builtInValidators: {
			email: {
				name: "Email",
				type: "shortcut",
				shortcut: "validemail"
			},
			validemail: {
				name: "Validemail",
				type: "regex",
				regex: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\.[A-Za-z]{2,4}",
				message: "Неправильный email адрес<!-- data-validator-validemail-message to override -->"
			},
			passwordagain: {
				name: "Passwordagain",
				type: "match",
				match: "password",
				message: "Неправильный пароль<!-- data-validator-paswordagain-message to override -->"
			},
			positive: {
				name: "Positive",
				type: "shortcut",
				shortcut: "number,positivenumber"
			},
			negative: {
				name: "Negative",
				type: "shortcut",
				shortcut: "number,negativenumber"
			},
			number: {
				name: "Number",
				type: "regex",
				regex: "([+-]?\\\d+(\\\.\\\d*)?([eE][+-]?[0-9]+)?)?",
				message: "Must be a number<!-- data-validator-number-message to override -->"
			},
			integer: {
				name: "Integer",
				type: "regex",
				regex: "[+-]?\\\d+",
				message: "No decimal places allowed<!-- data-validator-integer-message to override -->"
			},
			positivenumber: {
				name: "Positivenumber",
				type: "min",
				min: 0,
				message: "Must be a positive number<!-- data-validator-positivenumber-message to override -->"
			},
			negativenumber: {
				name: "Negativenumber",
				type: "max",
				max: 0,
				message: "Must be a negative number<!-- data-validator-negativenumber-message to override -->"
			},
			required: {
				name: "Required",
				type: "required",
				message: "Обязательно для заполнения<!-- data-validator-required-message to override -->"
			},
			checkone: {
				name: "Checkone",
				type: "minchecked",
				minchecked: 1,
				message: "Check at least one option<!-- data-validation-checkone-message to override -->"
			}
		}
	};

	var formatValidatorName = function (name) {
		return name
			.toLowerCase()
			.replace(
				/(^|\s)([a-z])/g ,
				function(m,p1,p2) {
					return p1+p2.toUpperCase();
				}
			)
		;
	};

	var getValue = function ($this) {
		// Extract the value we're talking about
		var value = $this.val();
		var type = $this.attr("type");
		if (type === "checkbox") {
			value = ($this.is(":checked") ? value : "");
		}
		if (type === "radio") {
			value = ($('input[name="' + $this.attr("name") + '"]:checked').length > 0 ? value : "");
		}
		return value;
	};

  function regexFromString(inputstring) {
		return new RegExp("^" + inputstring + "$");
	}

  /**
   * Thanks to Jason Bunting via StackOverflow.com
   *
   * http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string#answer-359910
   * Short link: http://tinyurl.com/executeFunctionByName
  **/
  function executeFunctionByName(functionName, context /*, args*/) {
    var args = Array.prototype.slice.call(arguments).splice(2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(this, args);
  }

	$.fn.jqBootstrapValidation = function( method ) {

		if ( defaults.methods[method] ) {
			return defaults.methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return defaults.methods.init.apply( this, arguments );
		} else {
		$.error( 'Method ' +  method + ' does not exist on jQuery.jqBootstrapValidation' );
			return null;
		}

	};

  $.jqBootstrapValidation = function (options) {
    $(":input").not("[type=image],[type=submit]").jqBootstrapValidation.apply(this,arguments);
  };

})( jQuery );

/**
 * Isotope v1.5.25
 * An exquisite jQuery plugin for magical layouts
 * http://isotope.metafizzy.co
 *
 * Commercial use requires one-time license fee
 * http://metafizzy.co/#licenses
 *
 * Copyright 2012 David DeSandro / Metafizzy
 */

/*jshint asi: true, browser: true, curly: true, eqeqeq: true, forin: false, immed: false, newcap: true, noempty: true, strict: true, undef: true */
/*global jQuery: false */

(function( window, $, undefined ){

  'use strict';

  // get global vars
  var document = window.document;
  var Modernizr = window.Modernizr;

  // helper function
  var capitalize = function( str ) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // ========================= getStyleProperty by kangax ===============================
  // http://perfectionkills.com/feature-testing-css-properties/

  var prefixes = 'Moz Webkit O Ms'.split(' ');

  var getStyleProperty = function( propName ) {
    var style = document.documentElement.style,
        prefixed;

    // test standard property first
    if ( typeof style[propName] === 'string' ) {
      return propName;
    }

    // capitalize
    propName = capitalize( propName );

    // test vendor specific properties
    for ( var i=0, len = prefixes.length; i < len; i++ ) {
      prefixed = prefixes[i] + propName;
      if ( typeof style[ prefixed ] === 'string' ) {
        return prefixed;
      }
    }
  };

  var transformProp = getStyleProperty('transform'),
      transitionProp = getStyleProperty('transitionProperty');


  // ========================= miniModernizr ===============================
  // <3<3<3 and thanks to Faruk and Paul for doing the heavy lifting

  /*!
   * Modernizr v1.6ish: miniModernizr for Isotope
   * http://www.modernizr.com
   *
   * Developed by:
   * - Faruk Ates  http://farukat.es/
   * - Paul Irish  http://paulirish.com/
   *
   * Copyright (c) 2009-2010
   * Dual-licensed under the BSD or MIT licenses.
   * http://www.modernizr.com/license/
   */

  /*
   * This version whittles down the script just to check support for
   * CSS transitions, transforms, and 3D transforms.
  */

  var tests = {
    csstransforms: function() {
      return !!transformProp;
    },

    csstransforms3d: function() {
      var test = !!getStyleProperty('perspective');
      // double check for Chrome's false positive
      if ( test ) {
        var vendorCSSPrefixes = ' -o- -moz- -ms- -webkit- -khtml- '.split(' '),
            mediaQuery = '@media (' + vendorCSSPrefixes.join('transform-3d),(') + 'modernizr)',
            $style = $('<style>' + mediaQuery + '{#modernizr{height:3px}}' + '</style>')
                        .appendTo('head'),
            $div = $('<div id="modernizr" />').appendTo('html');

        test = $div.height() === 3;

        $div.remove();
        $style.remove();
      }
      return test;
    },

    csstransitions: function() {
      return !!transitionProp;
    }
  };

  var testName;

  if ( Modernizr ) {
    // if there's a previous Modernzir, check if there are necessary tests
    for ( testName in tests) {
      if ( !Modernizr.hasOwnProperty( testName ) ) {
        // if test hasn't been run, use addTest to run it
        Modernizr.addTest( testName, tests[ testName ] );
      }
    }
  } else {
    // or create new mini Modernizr that just has the 3 tests
    Modernizr = window.Modernizr = {
      _version : '1.6ish: miniModernizr for Isotope'
    };

    var classes = ' ';
    var result;

    // Run through tests
    for ( testName in tests) {
      result = tests[ testName ]();
      Modernizr[ testName ] = result;
      classes += ' ' + ( result ?  '' : 'no-' ) + testName;
    }

    // Add the new classes to the <html> element.
    $('html').addClass( classes );
  }


  // ========================= isoTransform ===============================

  /**
   *  provides hooks for .css({ scale: value, translate: [x, y] })
   *  Progressively enhanced CSS transforms
   *  Uses hardware accelerated 3D transforms for Safari
   *  or falls back to 2D transforms.
   */

  if ( Modernizr.csstransforms ) {

        // i.e. transformFnNotations.scale(0.5) >> 'scale3d( 0.5, 0.5, 1)'
    var transformFnNotations = Modernizr.csstransforms3d ?
      { // 3D transform functions
        translate : function ( position ) {
          return 'translate3d(' + position[0] + 'px, ' + position[1] + 'px, 0) ';
        },
        scale : function ( scale ) {
          return 'scale3d(' + scale + ', ' + scale + ', 1) ';
        }
      } :
      { // 2D transform functions
        translate : function ( position ) {
          return 'translate(' + position[0] + 'px, ' + position[1] + 'px) ';
        },
        scale : function ( scale ) {
          return 'scale(' + scale + ') ';
        }
      }
    ;

    var setIsoTransform = function ( elem, name, value ) {
          // unpack current transform data
      var data =  $.data( elem, 'isoTransform' ) || {},
          newData = {},
          fnName,
          transformObj = {},
          transformValue;

      // i.e. newData.scale = 0.5
      newData[ name ] = value;
      // extend new value over current data
      $.extend( data, newData );

      for ( fnName in data ) {
        transformValue = data[ fnName ];
        transformObj[ fnName ] = transformFnNotations[ fnName ]( transformValue );
      }

      // get proper order
      // ideally, we could loop through this give an array, but since we only have
      // a couple transforms we're keeping track of, we'll do it like so
      var translateFn = transformObj.translate || '',
          scaleFn = transformObj.scale || '',
          // sorting so translate always comes first
          valueFns = translateFn + scaleFn;

      // set data back in elem
      $.data( elem, 'isoTransform', data );

      // set name to vendor specific property
      elem.style[ transformProp ] = valueFns;
    };

    // ==================== scale ===================

    $.cssNumber.scale = true;

    $.cssHooks.scale = {
      set: function( elem, value ) {
        // uncomment this bit if you want to properly parse strings
        // if ( typeof value === 'string' ) {
        //   value = parseFloat( value );
        // }
        setIsoTransform( elem, 'scale', value );
      },
      get: function( elem, computed ) {
        var transform = $.data( elem, 'isoTransform' );
        return transform && transform.scale ? transform.scale : 1;
      }
    };

    $.fx.step.scale = function( fx ) {
      $.cssHooks.scale.set( fx.elem, fx.now+fx.unit );
    };


    // ==================== translate ===================

    $.cssNumber.translate = true;

    $.cssHooks.translate = {
      set: function( elem, value ) {

        // uncomment this bit if you want to properly parse strings
        // if ( typeof value === 'string' ) {
        //   value = value.split(' ');
        // }
        //
        // var i, val;
        // for ( i = 0; i < 2; i++ ) {
        //   val = value[i];
        //   if ( typeof val === 'string' ) {
        //     val = parseInt( val );
        //   }
        // }

        setIsoTransform( elem, 'translate', value );
      },

      get: function( elem, computed ) {
        var transform = $.data( elem, 'isoTransform' );
        return transform && transform.translate ? transform.translate : [ 0, 0 ];
      }
    };

  }

  // ========================= get transition-end event ===============================
  var transitionEndEvent, transitionDurProp;

  if ( Modernizr.csstransitions ) {
    transitionEndEvent = {
      WebkitTransitionProperty: 'webkitTransitionEnd',  // webkit
      MozTransitionProperty: 'transitionend',
      OTransitionProperty: 'oTransitionEnd otransitionend',
      transitionProperty: 'transitionend'
    }[ transitionProp ];

    transitionDurProp = getStyleProperty('transitionDuration');
  }

  // ========================= smartresize ===============================

  /*
   * smartresize: debounced resize event for jQuery
   *
   * latest version and complete README available on Github:
   * https://github.com/louisremi/jquery.smartresize.js
   *
   * Copyright 2011 @louis_remi
   * Licensed under the MIT license.
   */

  var $event = $.event,
      dispatchMethod = $.event.handle ? 'handle' : 'dispatch',
      resizeTimeout;

  $event.special.smartresize = {
    setup: function() {
      $(this).bind( "resize", $event.special.smartresize.handler );
    },
    teardown: function() {
      $(this).unbind( "resize", $event.special.smartresize.handler );
    },
    handler: function( event, execAsap ) {
      // Save the context
      var context = this,
          args = arguments;

      // set correct event type
      event.type = "smartresize";

      if ( resizeTimeout ) { clearTimeout( resizeTimeout ); }
      resizeTimeout = setTimeout(function() {
        $event[ dispatchMethod ].apply( context, args );
      }, execAsap === "execAsap"? 0 : 100 );
    }
  };

  $.fn.smartresize = function( fn ) {
    return fn ? this.bind( "smartresize", fn ) : this.trigger( "smartresize", ["execAsap"] );
  };



// ========================= Isotope ===============================


  // our "Widget" object constructor
  $.Isotope = function( options, element, callback ){
    this.element = $( element );

    this._create( options );
    this._init( callback );
  };

  // styles of container element we want to keep track of
  var isoContainerStyles = [ 'width', 'height' ];

  var $window = $(window);

  $.Isotope.settings = {
    resizable: true,
    layoutMode : 'masonry',
    containerClass : 'isotope',
    itemClass : 'isotope-item',
    hiddenClass : 'isotope-hidden',
    hiddenStyle: { opacity: 0, scale: 0.001 },
    visibleStyle: { opacity: 1, scale: 1 },
    containerStyle: {
      position: 'relative',
      overflow: 'hidden'
    },
    animationEngine: 'best-available',
    animationOptions: {
      queue: false,
      duration: 800
    },
    sortBy : 'original-order',
    sortAscending : true,
    resizesContainer : true,
    transformsEnabled: true,
    itemPositionDataEnabled: false
  };

  $.Isotope.prototype = {

    // sets up widget
    _create : function( options ) {

      this.options = $.extend( {}, $.Isotope.settings, options );

      this.styleQueue = [];
      this.elemCount = 0;

      // get original styles in case we re-apply them in .destroy()
      var elemStyle = this.element[0].style;
      this.originalStyle = {};
      // keep track of container styles
      var containerStyles = isoContainerStyles.slice(0);
      for ( var prop in this.options.containerStyle ) {
        containerStyles.push( prop );
      }
      for ( var i=0, len = containerStyles.length; i < len; i++ ) {
        prop = containerStyles[i];
        this.originalStyle[ prop ] = elemStyle[ prop ] || '';
      }
      // apply container style from options
      this.element.css( this.options.containerStyle );

      this._updateAnimationEngine();
      this._updateUsingTransforms();

      // sorting
      var originalOrderSorter = {
        'original-order' : function( $elem, instance ) {
          instance.elemCount ++;
          return instance.elemCount;
        },
        random : function() {
          return Math.random();
        }
      };

      this.options.getSortData = $.extend( this.options.getSortData, originalOrderSorter );

      // need to get atoms
      this.reloadItems();

      // get top left position of where the bricks should be
      this.offset = {
        left: parseInt( ( this.element.css('padding-left') || 0 ), 10 ),
        top: parseInt( ( this.element.css('padding-top') || 0 ), 10 )
      };

      // add isotope class first time around
      var instance = this;
      setTimeout( function() {
        instance.element.addClass( instance.options.containerClass );
      }, 0 );

      // bind resize method
      if ( this.options.resizable ) {
        $window.bind( 'smartresize.isotope', function() {
          instance.resize();
        });
      }

      // dismiss all click events from hidden events
      this.element.delegate( '.' + this.options.hiddenClass, 'click', function(){
        return false;
      });

    },

    _getAtoms : function( $elems ) {
      var selector = this.options.itemSelector,
          // filter & find
          $atoms = selector ? $elems.filter( selector ).add( $elems.find( selector ) ) : $elems,
          // base style for atoms
          atomStyle = { position: 'absolute' };

      // filter out text nodes
      $atoms = $atoms.filter( function( i, atom ) {
        return atom.nodeType === 1;
      });

      if ( this.usingTransforms ) {
        atomStyle.left = 0;
        atomStyle.top = 0;
      }

      $atoms.css( atomStyle ).addClass( this.options.itemClass );

      this.updateSortData( $atoms, true );

      return $atoms;
    },

    // _init fires when your instance is first created
    // (from the constructor above), and when you
    // attempt to initialize the widget again (by the bridge)
    // after it has already been initialized.
    _init : function( callback ) {

      this.$filteredAtoms = this._filter( this.$allAtoms );
      this._sort();
      this.reLayout( callback );

    },

    option : function( opts ){
      // change options AFTER initialization:
      // signature: $('#foo').bar({ cool:false });
      if ( $.isPlainObject( opts ) ){
        this.options = $.extend( true, this.options, opts );

        // trigger _updateOptionName if it exists
        var updateOptionFn;
        for ( var optionName in opts ) {
          updateOptionFn = '_update' + capitalize( optionName );
          if ( this[ updateOptionFn ] ) {
            this[ updateOptionFn ]();
          }
        }
      }
    },

    // ====================== updaters ====================== //
    // kind of like setters

    _updateAnimationEngine : function() {
      var animationEngine = this.options.animationEngine.toLowerCase().replace( /[ _\-]/g, '');
      var isUsingJQueryAnimation;
      // set applyStyleFnName
      switch ( animationEngine ) {
        case 'css' :
        case 'none' :
          isUsingJQueryAnimation = false;
          break;
        case 'jquery' :
          isUsingJQueryAnimation = true;
          break;
        default : // best available
          isUsingJQueryAnimation = !Modernizr.csstransitions;
      }
      this.isUsingJQueryAnimation = isUsingJQueryAnimation;
      this._updateUsingTransforms();
    },

    _updateTransformsEnabled : function() {
      this._updateUsingTransforms();
    },

    _updateUsingTransforms : function() {
      var usingTransforms = this.usingTransforms = this.options.transformsEnabled &&
        Modernizr.csstransforms && Modernizr.csstransitions && !this.isUsingJQueryAnimation;

      // prevent scales when transforms are disabled
      if ( !usingTransforms ) {
        delete this.options.hiddenStyle.scale;
        delete this.options.visibleStyle.scale;
      }

      this.getPositionStyles = usingTransforms ? this._translate : this._positionAbs;
    },


    // ====================== Filtering ======================

    _filter : function( $atoms ) {
      var filter = this.options.filter === '' ? '*' : this.options.filter;

      if ( !filter ) {
        return $atoms;
      }

      var hiddenClass    = this.options.hiddenClass,
          hiddenSelector = '.' + hiddenClass,
          $hiddenAtoms   = $atoms.filter( hiddenSelector ),
          $atomsToShow   = $hiddenAtoms;

      if ( filter !== '*' ) {
        $atomsToShow = $hiddenAtoms.filter( filter );
        var $atomsToHide = $atoms.not( hiddenSelector ).not( filter ).addClass( hiddenClass );
        this.styleQueue.push({ $el: $atomsToHide, style: this.options.hiddenStyle });
      }

      this.styleQueue.push({ $el: $atomsToShow, style: this.options.visibleStyle });
      $atomsToShow.removeClass( hiddenClass );

      return $atoms.filter( filter );
    },

    // ====================== Sorting ======================

    updateSortData : function( $atoms, isIncrementingElemCount ) {
      var instance = this,
          getSortData = this.options.getSortData,
          $this, sortData;
      $atoms.each(function(){
        $this = $(this);
        sortData = {};
        // get value for sort data based on fn( $elem ) passed in
        for ( var key in getSortData ) {
          if ( !isIncrementingElemCount && key === 'original-order' ) {
            // keep original order original
            sortData[ key ] = $.data( this, 'isotope-sort-data' )[ key ];
          } else {
            sortData[ key ] = getSortData[ key ]( $this, instance );
          }
        }
        // apply sort data to element
        $.data( this, 'isotope-sort-data', sortData );
      });
    },

    // used on all the filtered atoms
    _sort : function() {

      var sortBy = this.options.sortBy,
          getSorter = this._getSorter,
          sortDir = this.options.sortAscending ? 1 : -1,
          sortFn = function( alpha, beta ) {
            var a = getSorter( alpha, sortBy ),
                b = getSorter( beta, sortBy );
            // fall back to original order if data matches
            if ( a === b && sortBy !== 'original-order') {
              a = getSorter( alpha, 'original-order' );
              b = getSorter( beta, 'original-order' );
            }
            return ( ( a > b ) ? 1 : ( a < b ) ? -1 : 0 ) * sortDir;
          };

      this.$filteredAtoms.sort( sortFn );
    },

    _getSorter : function( elem, sortBy ) {
      return $.data( elem, 'isotope-sort-data' )[ sortBy ];
    },

    // ====================== Layout Helpers ======================

    _translate : function( x, y ) {
      return { translate : [ x, y ] };
    },

    _positionAbs : function( x, y ) {
      return { left: x, top: y };
    },

    _pushPosition : function( $elem, x, y ) {
      x = Math.round( x + this.offset.left );
      y = Math.round( y + this.offset.top );
      var position = this.getPositionStyles( x, y );
      this.styleQueue.push({ $el: $elem, style: position });
      if ( this.options.itemPositionDataEnabled ) {
        $elem.data('isotope-item-position', {x: x, y: y} );
      }
    },


    // ====================== General Layout ======================

    // used on collection of atoms (should be filtered, and sorted before )
    // accepts atoms-to-be-laid-out to start with
    layout : function( $elems, callback ) {

      var layoutMode = this.options.layoutMode;

      // layout logic
      this[ '_' +  layoutMode + 'Layout' ]( $elems );

      // set the size of the container
      if ( this.options.resizesContainer ) {
        var containerStyle = this[ '_' +  layoutMode + 'GetContainerSize' ]();
        this.styleQueue.push({ $el: this.element, style: containerStyle });
      }

      this._processStyleQueue( $elems, callback );

      this.isLaidOut = true;
    },

    _processStyleQueue : function( $elems, callback ) {
      // are we animating the layout arrangement?
      // use plugin-ish syntax for css or animate
      var styleFn = !this.isLaidOut ? 'css' : (
            this.isUsingJQueryAnimation ? 'animate' : 'css'
          ),
          animOpts = this.options.animationOptions,
          onLayout = this.options.onLayout,
          objStyleFn, processor,
          triggerCallbackNow, callbackFn;

      // default styleQueue processor, may be overwritten down below
      processor = function( i, obj ) {
        obj.$el[ styleFn ]( obj.style, animOpts );
      };

      if ( this._isInserting && this.isUsingJQueryAnimation ) {
        // if using styleQueue to insert items
        processor = function( i, obj ) {
          // only animate if it not being inserted
          objStyleFn = obj.$el.hasClass('no-transition') ? 'css' : styleFn;
          obj.$el[ objStyleFn ]( obj.style, animOpts );
        };

      } else if ( callback || onLayout || animOpts.complete ) {
        // has callback
        var isCallbackTriggered = false,
            // array of possible callbacks to trigger
            callbacks = [ callback, onLayout, animOpts.complete ],
            instance = this;
        triggerCallbackNow = true;
        // trigger callback only once
        callbackFn = function() {
          if ( isCallbackTriggered ) {
            return;
          }
          var hollaback;
          for (var i=0, len = callbacks.length; i < len; i++) {
            hollaback = callbacks[i];
            if ( typeof hollaback === 'function' ) {
              hollaback.call( instance.element, $elems, instance );
            }
          }
          isCallbackTriggered = true;
        };

        if ( this.isUsingJQueryAnimation && styleFn === 'animate' ) {
          // add callback to animation options
          animOpts.complete = callbackFn;
          triggerCallbackNow = false;

        } else if ( Modernizr.csstransitions ) {
          // detect if first item has transition
          var i = 0,
              firstItem = this.styleQueue[0],
              testElem = firstItem && firstItem.$el,
              styleObj;
          // get first non-empty jQ object
          while ( !testElem || !testElem.length ) {
            styleObj = this.styleQueue[ i++ ];
            // HACK: sometimes styleQueue[i] is undefined
            if ( !styleObj ) {
              return;
            }
            testElem = styleObj.$el;
          }
          // get transition duration of the first element in that object
          // yeah, this is inexact
          var duration = parseFloat( getComputedStyle( testElem[0] )[ transitionDurProp ] );
          if ( duration > 0 ) {
            processor = function( i, obj ) {
              obj.$el[ styleFn ]( obj.style, animOpts )
                // trigger callback at transition end
                .one( transitionEndEvent, callbackFn );
            };
            triggerCallbackNow = false;
          }
        }
      }

      // process styleQueue
      $.each( this.styleQueue, processor );

      if ( triggerCallbackNow ) {
        callbackFn();
      }

      // clear out queue for next time
      this.styleQueue = [];
    },


    resize : function() {
      if ( this[ '_' + this.options.layoutMode + 'ResizeChanged' ]() ) {
        this.reLayout();
      }
    },


    reLayout : function( callback ) {

      this[ '_' +  this.options.layoutMode + 'Reset' ]();
      this.layout( this.$filteredAtoms, callback );

    },

    // ====================== Convenience methods ======================

    // ====================== Adding items ======================

    // adds a jQuery object of items to a isotope container
    addItems : function( $content, callback ) {
      var $newAtoms = this._getAtoms( $content );
      // add new atoms to atoms pools
      this.$allAtoms = this.$allAtoms.add( $newAtoms );

      if ( callback ) {
        callback( $newAtoms );
      }
    },

    // convienence method for adding elements properly to any layout
    // positions items, hides them, then animates them back in <--- very sezzy
    insert : function( $content, callback ) {
      // position items
      this.element.append( $content );

      var instance = this;
      this.addItems( $content, function( $newAtoms ) {
        var $newFilteredAtoms = instance._filter( $newAtoms );
        instance._addHideAppended( $newFilteredAtoms );
        instance._sort();
        instance.reLayout();
        instance._revealAppended( $newFilteredAtoms, callback );
      });

    },

    // convienence method for working with Infinite Scroll
    appended : function( $content, callback ) {
      var instance = this;
      this.addItems( $content, function( $newAtoms ) {
        instance._addHideAppended( $newAtoms );
        instance.layout( $newAtoms );
        instance._revealAppended( $newAtoms, callback );
      });
    },

    // adds new atoms, then hides them before positioning
    _addHideAppended : function( $newAtoms ) {
      this.$filteredAtoms = this.$filteredAtoms.add( $newAtoms );
      $newAtoms.addClass('no-transition');

      this._isInserting = true;

      // apply hidden styles
      this.styleQueue.push({ $el: $newAtoms, style: this.options.hiddenStyle });
    },

    // sets visible style on new atoms
    _revealAppended : function( $newAtoms, callback ) {
      var instance = this;
      // apply visible style after a sec
      setTimeout( function() {
        // enable animation
        $newAtoms.removeClass('no-transition');
        // reveal newly inserted filtered elements
        instance.styleQueue.push({ $el: $newAtoms, style: instance.options.visibleStyle });
        instance._isInserting = false;
        instance._processStyleQueue( $newAtoms, callback );
      }, 10 );
    },

    // gathers all atoms
    reloadItems : function() {
      this.$allAtoms = this._getAtoms( this.element.children() );
    },

    // removes elements from Isotope widget
    remove: function( $content, callback ) {
      // remove elements immediately from Isotope instance
      this.$allAtoms = this.$allAtoms.not( $content );
      this.$filteredAtoms = this.$filteredAtoms.not( $content );
      // remove() as a callback, for after transition / animation
      var instance = this;
      var removeContent = function() {
        $content.remove();
        if ( callback ) {
          callback.call( instance.element );
        }
      };

      if ( $content.filter( ':not(.' + this.options.hiddenClass + ')' ).length ) {
        // if any non-hidden content needs to be removed
        this.styleQueue.push({ $el: $content, style: this.options.hiddenStyle });
        this._sort();
        this.reLayout( removeContent );
      } else {
        // remove it now
        removeContent();
      }

    },

    shuffle : function( callback ) {
      this.updateSortData( this.$allAtoms );
      this.options.sortBy = 'random';
      this._sort();
      this.reLayout( callback );
    },

    // destroys widget, returns elements and container back (close) to original style
    destroy : function() {

      var usingTransforms = this.usingTransforms;
      var options = this.options;

      this.$allAtoms
        .removeClass( options.hiddenClass + ' ' + options.itemClass )
        .each(function(){
          var style = this.style;
          style.position = '';
          style.top = '';
          style.left = '';
          style.opacity = '';
          if ( usingTransforms ) {
            style[ transformProp ] = '';
          }
        });

      // re-apply saved container styles
      var elemStyle = this.element[0].style;
      for ( var prop in this.originalStyle ) {
        elemStyle[ prop ] = this.originalStyle[ prop ];
      }

      this.element
        .unbind('.isotope')
        .undelegate( '.' + options.hiddenClass, 'click' )
        .removeClass( options.containerClass )
        .removeData('isotope');

      $window.unbind('.isotope');

    },


    // ====================== LAYOUTS ======================

    // calculates number of rows or columns
    // requires columnWidth or rowHeight to be set on namespaced object
    // i.e. this.masonry.columnWidth = 200
    _getSegments : function( isRows ) {
      var namespace = this.options.layoutMode,
          measure  = isRows ? 'rowHeight' : 'columnWidth',
          size     = isRows ? 'height' : 'width',
          segmentsName = isRows ? 'rows' : 'cols',
          containerSize = this.element[ size ](),
          segments,
                    // i.e. options.masonry && options.masonry.columnWidth
          segmentSize = this.options[ namespace ] && this.options[ namespace ][ measure ] ||
                    // or use the size of the first item, i.e. outerWidth
                    this.$filteredAtoms[ 'outer' + capitalize(size) ](true) ||
                    // if there's no items, use size of container
                    containerSize;

      segments = Math.floor( containerSize / segmentSize );
      segments = Math.max( segments, 1 );

      // i.e. this.masonry.cols = ....
      this[ namespace ][ segmentsName ] = segments;
      // i.e. this.masonry.columnWidth = ...
      this[ namespace ][ measure ] = segmentSize;

    },

    _checkIfSegmentsChanged : function( isRows ) {
      var namespace = this.options.layoutMode,
          segmentsName = isRows ? 'rows' : 'cols',
          prevSegments = this[ namespace ][ segmentsName ];
      // update cols/rows
      this._getSegments( isRows );
      // return if updated cols/rows is not equal to previous
      return ( this[ namespace ][ segmentsName ] !== prevSegments );
    },

    // ====================== Masonry ======================

    _masonryReset : function() {
      // layout-specific props
      this.masonry = {};
      // FIXME shouldn't have to call this again
      this._getSegments();
      var i = this.masonry.cols;
      this.masonry.colYs = [];
      while (i--) {
        this.masonry.colYs.push( 0 );
      }
    },

    _masonryLayout : function( $elems ) {
      var instance = this,
          props = instance.masonry;
      $elems.each(function(){
        var $this  = $(this),
            //how many columns does this brick span
            colSpan = Math.ceil( $this.outerWidth(true) / props.columnWidth );
        colSpan = Math.min( colSpan, props.cols );

        if ( colSpan === 1 ) {
          // if brick spans only one column, just like singleMode
          instance._masonryPlaceBrick( $this, props.colYs );
        } else {
          // brick spans more than one column
          // how many different places could this brick fit horizontally
          var groupCount = props.cols + 1 - colSpan,
              groupY = [],
              groupColY,
              i;

          // for each group potential horizontal position
          for ( i=0; i < groupCount; i++ ) {
            // make an array of colY values for that one group
            groupColY = props.colYs.slice( i, i+colSpan );
            // and get the max value of the array
            groupY[i] = Math.max.apply( Math, groupColY );
          }

          instance._masonryPlaceBrick( $this, groupY );
        }
      });
    },

    // worker method that places brick in the columnSet
    //   with the the minY
    _masonryPlaceBrick : function( $brick, setY ) {
      // get the minimum Y value from the columns
      var minimumY = Math.min.apply( Math, setY ),
          shortCol = 0;

      // Find index of short column, the first from the left
      for (var i=0, len = setY.length; i < len; i++) {
        if ( setY[i] === minimumY ) {
          shortCol = i;
          break;
        }
      }

      // position the brick
      var x = this.masonry.columnWidth * shortCol,
          y = minimumY;
      this._pushPosition( $brick, x, y );

      // apply setHeight to necessary columns
      var setHeight = minimumY + $brick.outerHeight(true),
          setSpan = this.masonry.cols + 1 - len;
      for ( i=0; i < setSpan; i++ ) {
        this.masonry.colYs[ shortCol + i ] = setHeight;
      }

    },

    _masonryGetContainerSize : function() {
      var containerHeight = Math.max.apply( Math, this.masonry.colYs );
      return { height: containerHeight };
    },

    _masonryResizeChanged : function() {
      return this._checkIfSegmentsChanged();
    },

    // ====================== fitRows ======================

    _fitRowsReset : function() {
      this.fitRows = {
        x : 0,
        y : 0,
        height : 0
      };
    },

    _fitRowsLayout : function( $elems ) {
      var instance = this,
          containerWidth = this.element.width(),
          props = this.fitRows;

      $elems.each( function() {
        var $this = $(this),
            atomW = $this.outerWidth(true),
            atomH = $this.outerHeight(true);

        if ( props.x !== 0 && atomW + props.x > containerWidth ) {
          // if this element cannot fit in the current row
          props.x = 0;
          props.y = props.height;
        }

        // position the atom
        instance._pushPosition( $this, props.x, props.y );

        props.height = Math.max( props.y + atomH, props.height );
        props.x += atomW;

      });
    },

    _fitRowsGetContainerSize : function () {
      return { height : this.fitRows.height };
    },

    _fitRowsResizeChanged : function() {
      return true;
    },


    // ====================== cellsByRow ======================

    _cellsByRowReset : function() {
      this.cellsByRow = {
        index : 0
      };
      // get this.cellsByRow.columnWidth
      this._getSegments();
      // get this.cellsByRow.rowHeight
      this._getSegments(true);
    },

    _cellsByRowLayout : function( $elems ) {
      var instance = this,
          props = this.cellsByRow;
      $elems.each( function(){
        var $this = $(this),
            col = props.index % props.cols,
            row = Math.floor( props.index / props.cols ),
            x = ( col + 0.5 ) * props.columnWidth - $this.outerWidth(true) / 2,
            y = ( row + 0.5 ) * props.rowHeight - $this.outerHeight(true) / 2;
        instance._pushPosition( $this, x, y );
        props.index ++;
      });
    },

    _cellsByRowGetContainerSize : function() {
      return { height : Math.ceil( this.$filteredAtoms.length / this.cellsByRow.cols ) * this.cellsByRow.rowHeight + this.offset.top };
    },

    _cellsByRowResizeChanged : function() {
      return this._checkIfSegmentsChanged();
    },


    // ====================== straightDown ======================

    _straightDownReset : function() {
      this.straightDown = {
        y : 0
      };
    },

    _straightDownLayout : function( $elems ) {
      var instance = this;
      $elems.each( function( i ){
        var $this = $(this);
        instance._pushPosition( $this, 0, instance.straightDown.y );
        instance.straightDown.y += $this.outerHeight(true);
      });
    },

    _straightDownGetContainerSize : function() {
      return { height : this.straightDown.y };
    },

    _straightDownResizeChanged : function() {
      return true;
    },


    // ====================== masonryHorizontal ======================

    _masonryHorizontalReset : function() {
      // layout-specific props
      this.masonryHorizontal = {};
      // FIXME shouldn't have to call this again
      this._getSegments( true );
      var i = this.masonryHorizontal.rows;
      this.masonryHorizontal.rowXs = [];
      while (i--) {
        this.masonryHorizontal.rowXs.push( 0 );
      }
    },

    _masonryHorizontalLayout : function( $elems ) {
      var instance = this,
          props = instance.masonryHorizontal;
      $elems.each(function(){
        var $this  = $(this),
            //how many rows does this brick span
            rowSpan = Math.ceil( $this.outerHeight(true) / props.rowHeight );
        rowSpan = Math.min( rowSpan, props.rows );

        if ( rowSpan === 1 ) {
          // if brick spans only one column, just like singleMode
          instance._masonryHorizontalPlaceBrick( $this, props.rowXs );
        } else {
          // brick spans more than one row
          // how many different places could this brick fit horizontally
          var groupCount = props.rows + 1 - rowSpan,
              groupX = [],
              groupRowX, i;

          // for each group potential horizontal position
          for ( i=0; i < groupCount; i++ ) {
            // make an array of colY values for that one group
            groupRowX = props.rowXs.slice( i, i+rowSpan );
            // and get the max value of the array
            groupX[i] = Math.max.apply( Math, groupRowX );
          }

          instance._masonryHorizontalPlaceBrick( $this, groupX );
        }
      });
    },

    _masonryHorizontalPlaceBrick : function( $brick, setX ) {
      // get the minimum Y value from the columns
      var minimumX  = Math.min.apply( Math, setX ),
          smallRow  = 0;
      // Find index of smallest row, the first from the top
      for (var i=0, len = setX.length; i < len; i++) {
        if ( setX[i] === minimumX ) {
          smallRow = i;
          break;
        }
      }

      // position the brick
      var x = minimumX,
          y = this.masonryHorizontal.rowHeight * smallRow;
      this._pushPosition( $brick, x, y );

      // apply setHeight to necessary columns
      var setWidth = minimumX + $brick.outerWidth(true),
          setSpan = this.masonryHorizontal.rows + 1 - len;
      for ( i=0; i < setSpan; i++ ) {
        this.masonryHorizontal.rowXs[ smallRow + i ] = setWidth;
      }
    },

    _masonryHorizontalGetContainerSize : function() {
      var containerWidth = Math.max.apply( Math, this.masonryHorizontal.rowXs );
      return { width: containerWidth };
    },

    _masonryHorizontalResizeChanged : function() {
      return this._checkIfSegmentsChanged(true);
    },


    // ====================== fitColumns ======================

    _fitColumnsReset : function() {
      this.fitColumns = {
        x : 0,
        y : 0,
        width : 0
      };
    },

    _fitColumnsLayout : function( $elems ) {
      var instance = this,
          containerHeight = this.element.height(),
          props = this.fitColumns;
      $elems.each( function() {
        var $this = $(this),
            atomW = $this.outerWidth(true),
            atomH = $this.outerHeight(true);

        if ( props.y !== 0 && atomH + props.y > containerHeight ) {
          // if this element cannot fit in the current column
          props.x = props.width;
          props.y = 0;
        }

        // position the atom
        instance._pushPosition( $this, props.x, props.y );

        props.width = Math.max( props.x + atomW, props.width );
        props.y += atomH;

      });
    },

    _fitColumnsGetContainerSize : function () {
      return { width : this.fitColumns.width };
    },

    _fitColumnsResizeChanged : function() {
      return true;
    },



    // ====================== cellsByColumn ======================

    _cellsByColumnReset : function() {
      this.cellsByColumn = {
        index : 0
      };
      // get this.cellsByColumn.columnWidth
      this._getSegments();
      // get this.cellsByColumn.rowHeight
      this._getSegments(true);
    },

    _cellsByColumnLayout : function( $elems ) {
      var instance = this,
          props = this.cellsByColumn;
      $elems.each( function(){
        var $this = $(this),
            col = Math.floor( props.index / props.rows ),
            row = props.index % props.rows,
            x = ( col + 0.5 ) * props.columnWidth - $this.outerWidth(true) / 2,
            y = ( row + 0.5 ) * props.rowHeight - $this.outerHeight(true) / 2;
        instance._pushPosition( $this, x, y );
        props.index ++;
      });
    },

    _cellsByColumnGetContainerSize : function() {
      return { width : Math.ceil( this.$filteredAtoms.length / this.cellsByColumn.rows ) * this.cellsByColumn.columnWidth };
    },

    _cellsByColumnResizeChanged : function() {
      return this._checkIfSegmentsChanged(true);
    },

    // ====================== straightAcross ======================

    _straightAcrossReset : function() {
      this.straightAcross = {
        x : 0
      };
    },

    _straightAcrossLayout : function( $elems ) {
      var instance = this;
      $elems.each( function( i ){
        var $this = $(this);
        instance._pushPosition( $this, instance.straightAcross.x, 0 );
        instance.straightAcross.x += $this.outerWidth(true);
      });
    },

    _straightAcrossGetContainerSize : function() {
      return { width : this.straightAcross.x };
    },

    _straightAcrossResizeChanged : function() {
      return true;
    }

  };


  // ======================= imagesLoaded Plugin ===============================
  /*!
   * jQuery imagesLoaded plugin v1.1.0
   * http://github.com/desandro/imagesloaded
   *
   * MIT License. by Paul Irish et al.
   */


  // $('#my-container').imagesLoaded(myFunction)
  // or
  // $('img').imagesLoaded(myFunction)

  // execute a callback when all images have loaded.
  // needed because .load() doesn't work on cached images

  // callback function gets image collection as argument
  //  `this` is the container

  $.fn.imagesLoaded = function( callback ) {
    var $this = this,
        $images = $this.find('img').add( $this.filter('img') ),
        len = $images.length,
        blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
        loaded = [];

    function triggerCallback() {
      callback.call( $this, $images );
    }

    function imgLoaded( event ) {
      var img = event.target;
      if ( img.src !== blank && $.inArray( img, loaded ) === -1 ){
        loaded.push( img );
        if ( --len <= 0 ){
          setTimeout( triggerCallback );
          $images.unbind( '.imagesLoaded', imgLoaded );
        }
      }
    }

    // if no images, trigger immediately
    if ( !len ) {
      triggerCallback();
    }

    $images.bind( 'load.imagesLoaded error.imagesLoaded',  imgLoaded ).each( function() {
      // cached images don't fire load sometimes, so we reset src.
      var src = this.src;
      // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
      // data uri bypasses webkit log warning (thx doug jones)
      this.src = blank;
      this.src = src;
    });

    return $this;
  };


  // helper function for logging errors
  // $.error breaks jQuery chaining
  var logError = function( message ) {
    if ( window.console ) {
      window.console.error( message );
    }
  };

  // =======================  Plugin bridge  ===============================
  // leverages data method to either create or return $.Isotope constructor
  // A bit from jQuery UI
  //   https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
  // A bit from jcarousel
  //   https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js

  $.fn.isotope = function( options, callback ) {
    if ( typeof options === 'string' ) {
      // call method
      var args = Array.prototype.slice.call( arguments, 1 );

      this.each(function(){
        var instance = $.data( this, 'isotope' );
        if ( !instance ) {
          logError( "cannot call methods on isotope prior to initialization; " +
              "attempted to call method '" + options + "'" );
          return;
        }
        if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
          logError( "no such method '" + options + "' for isotope instance" );
          return;
        }
        // apply method
        instance[ options ].apply( instance, args );
      });
    } else {
      this.each(function() {
        var instance = $.data( this, 'isotope' );
        if ( instance ) {
          // apply options & init
          instance.option( options );
          instance._init( callback );
        } else {
          // initialize new instance
          $.data( this, 'isotope', new $.Isotope( options, this, callback ) );
        }
      });
    }
    // return jQuery object
    // so plugin methods do not have to
    return this;
  };

})( window, jQuery );
/* ------------------------------------------------------------------------
	Class: prettyPhoto
	Use: Lightbox clone for jQuery
	Author: Stephane Caron (http://www.no-margin-for-errors.com)
	Version: 3.1.5
------------------------------------------------------------------------- */
(function(e){function t(){var e=location.href;hashtag=e.indexOf("#prettyPhoto")!==-1?decodeURI(e.substring(e.indexOf("#prettyPhoto")+1,e.length)):false;return hashtag}function n(){if(typeof theRel=="undefined")return;location.hash=theRel+"/"+rel_index+"/"}function r(){if(location.href.indexOf("#prettyPhoto")!==-1)location.hash="prettyPhoto"}function i(e,t){e=e.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var n="[\\?&]"+e+"=([^&#]*)";var r=new RegExp(n);var i=r.exec(t);return i==null?"":i[1]}e.prettyPhoto={version:"3.1.5"};e.fn.prettyPhoto=function(s){function g(){e(".pp_loaderIcon").hide();projectedTop=scroll_pos["scrollTop"]+(d/2-a["containerHeight"]/2);if(projectedTop<0)projectedTop=0;$ppt.fadeTo(settings.animation_speed,1);$pp_pic_holder.find(".pp_content").animate({height:a["contentHeight"],width:a["contentWidth"]},settings.animation_speed);$pp_pic_holder.animate({top:projectedTop,left:v/2-a["containerWidth"]/2<0?0:v/2-a["containerWidth"]/2,width:a["containerWidth"]},settings.animation_speed,function(){$pp_pic_holder.find(".pp_hoverContainer,#fullResImage").height(a["height"]).width(a["width"]);$pp_pic_holder.find(".pp_fade").fadeIn(settings.animation_speed);if(isSet&&S(pp_images[set_position])=="image"){$pp_pic_holder.find(".pp_hoverContainer").show()}else{$pp_pic_holder.find(".pp_hoverContainer").hide()}if(settings.allow_expand){if(a["resized"]){e("a.pp_expand,a.pp_contract").show()}else{e("a.pp_expand").hide()}}if(settings.autoplay_slideshow&&!m&&!f)e.prettyPhoto.startSlideshow();settings.changepicturecallback();f=true});C();s.ajaxcallback()}function y(t){$pp_pic_holder.find("#pp_full_res object,#pp_full_res embed").css("visibility","hidden");$pp_pic_holder.find(".pp_fade").fadeOut(settings.animation_speed,function(){e(".pp_loaderIcon").show();t()})}function b(t){t>1?e(".pp_nav").show():e(".pp_nav").hide()}function w(e,t){resized=false;E(e,t);imageWidth=e,imageHeight=t;if((p>v||h>d)&&doresize&&settings.allow_resize&&!u){resized=true,fitting=false;while(!fitting){if(p>v){imageWidth=v-200;imageHeight=t/e*imageWidth}else if(h>d){imageHeight=d-200;imageWidth=e/t*imageHeight}else{fitting=true}h=imageHeight,p=imageWidth}if(p>v||h>d){w(p,h)}E(imageWidth,imageHeight)}return{width:Math.floor(imageWidth),height:Math.floor(imageHeight),containerHeight:Math.floor(h),containerWidth:Math.floor(p)+settings.horizontal_padding*2,contentHeight:Math.floor(l),contentWidth:Math.floor(c),resized:resized}}function E(t,n){t=parseFloat(t);n=parseFloat(n);$pp_details=$pp_pic_holder.find(".pp_details");$pp_details.width(t);detailsHeight=parseFloat($pp_details.css("marginTop"))+parseFloat($pp_details.css("marginBottom"));$pp_details=$pp_details.clone().addClass(settings.theme).width(t).appendTo(e("body")).css({position:"absolute",top:-1e4});detailsHeight+=$pp_details.height();detailsHeight=detailsHeight<=34?36:detailsHeight;$pp_details.remove();$pp_title=$pp_pic_holder.find(".ppt");$pp_title.width(t);titleHeight=parseFloat($pp_title.css("marginTop"))+parseFloat($pp_title.css("marginBottom"));$pp_title=$pp_title.clone().appendTo(e("body")).css({position:"absolute",top:-1e4});titleHeight+=$pp_title.height();$pp_title.remove();l=n+detailsHeight;c=t;h=l+titleHeight+$pp_pic_holder.find(".pp_top").height()+$pp_pic_holder.find(".pp_bottom").height();p=t}function S(e){if(e.match(/youtube\.com\/watch/i)||e.match(/youtu\.be/i)){return"youtube"}else if(e.match(/vimeo\.com/i)){return"vimeo"}else if(e.match(/\b.mov\b/i)){return"quicktime"}else if(e.match(/\b.swf\b/i)){return"flash"}else if(e.match(/\biframe=true\b/i)){return"iframe"}else if(e.match(/\bajax=true\b/i)){return"ajax"}else if(e.match(/\bcustom=true\b/i)){return"custom"}else if(e.substr(0,1)=="#"){return"inline"}else{return"image"}}function x(){if(doresize&&typeof $pp_pic_holder!="undefined"){scroll_pos=T();contentHeight=$pp_pic_holder.height(),contentwidth=$pp_pic_holder.width();projectedTop=d/2+scroll_pos["scrollTop"]-contentHeight/2;if(projectedTop<0)projectedTop=0;if(contentHeight>d)return;$pp_pic_holder.css({top:projectedTop,left:v/2+scroll_pos["scrollLeft"]-contentwidth/2})}}function T(){if(self.pageYOffset){return{scrollTop:self.pageYOffset,scrollLeft:self.pageXOffset}}else if(document.documentElement&&document.documentElement.scrollTop){return{scrollTop:document.documentElement.scrollTop,scrollLeft:document.documentElement.scrollLeft}}else if(document.body){return{scrollTop:document.body.scrollTop,scrollLeft:document.body.scrollLeft}}}function N(){d=e(window).height(),v=e(window).width();if(typeof $pp_overlay!="undefined")$pp_overlay.height(e(document).height()).width(v)}function C(){if(isSet&&settings.overlay_gallery&&S(pp_images[set_position])=="image"){itemWidth=52+5;navWidth=settings.theme=="facebook"||settings.theme=="pp_default"?50:30;itemsPerPage=Math.floor((a["containerWidth"]-100-navWidth)/itemWidth);itemsPerPage=itemsPerPage<pp_images.length?itemsPerPage:pp_images.length;totalPage=Math.ceil(pp_images.length/itemsPerPage)-1;if(totalPage==0){navWidth=0;$pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").hide()}else{$pp_gallery.find(".pp_arrow_next,.pp_arrow_previous").show()}galleryWidth=itemsPerPage*itemWidth;fullGalleryWidth=pp_images.length*itemWidth;$pp_gallery.css("margin-left",-(galleryWidth/2+navWidth/2)).find("div:first").width(galleryWidth+5).find("ul").width(fullGalleryWidth).find("li.selected").removeClass("selected");goToPage=Math.floor(set_position/itemsPerPage)<totalPage?Math.floor(set_position/itemsPerPage):totalPage;e.prettyPhoto.changeGalleryPage(goToPage);$pp_gallery_li.filter(":eq("+set_position+")").addClass("selected")}else{$pp_pic_holder.find(".pp_content").unbind("mouseenter mouseleave")}}function k(t){if(settings.social_tools)facebook_like_link=settings.social_tools.replace("{location_href}",encodeURIComponent(location.href));settings.markup=settings.markup.replace("{pp_social}","");e("body").append(settings.markup);$pp_pic_holder=e(".pp_pic_holder"),$ppt=e(".ppt"),$pp_overlay=e("div.pp_overlay");if(isSet&&settings.overlay_gallery){currentGalleryPage=0;toInject="";for(var n=0;n<pp_images.length;n++){if(!pp_images[n].match(/\b(jpg|jpeg|png|gif)\b/gi)){classname="default";img_src=""}else{classname="";img_src=pp_images[n]}toInject+="<li class='"+classname+"'><a href='#'><img src='"+img_src+"' width='50' alt='' /></a></li>"}toInject=settings.gallery_markup.replace(/{gallery}/g,toInject);$pp_pic_holder.find("#pp_full_res").after(toInject);$pp_gallery=e(".pp_pic_holder .pp_gallery"),$pp_gallery_li=$pp_gallery.find("li");$pp_gallery.find(".pp_arrow_next").click(function(){e.prettyPhoto.changeGalleryPage("next");e.prettyPhoto.stopSlideshow();return false});$pp_gallery.find(".pp_arrow_previous").click(function(){e.prettyPhoto.changeGalleryPage("previous");e.prettyPhoto.stopSlideshow();return false});$pp_pic_holder.find(".pp_content").hover(function(){$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeIn()},function(){$pp_pic_holder.find(".pp_gallery:not(.disabled)").fadeOut()});itemWidth=52+5;$pp_gallery_li.each(function(t){e(this).find("a").click(function(){e.prettyPhoto.changePage(t);e.prettyPhoto.stopSlideshow();return false})})}if(settings.slideshow){$pp_pic_holder.find(".pp_nav").prepend('<a href="#" class="pp_play">Play</a>');$pp_pic_holder.find(".pp_nav .pp_play").click(function(){e.prettyPhoto.startSlideshow();return false})}$pp_pic_holder.attr("class","pp_pic_holder "+settings.theme);$pp_overlay.css({opacity:0,height:e(document).height(),width:e(window).width()}).bind("click",function(){if(!settings.modal)e.prettyPhoto.close()});e("a.pp_close").bind("click",function(){e.prettyPhoto.close();return false});if(settings.allow_expand){e("a.pp_expand").bind("click",function(t){if(e(this).hasClass("pp_expand")){e(this).removeClass("pp_expand").addClass("pp_contract");doresize=false}else{e(this).removeClass("pp_contract").addClass("pp_expand");doresize=true}y(function(){e.prettyPhoto.open()});return false})}$pp_pic_holder.find(".pp_previous, .pp_nav .pp_arrow_previous").bind("click",function(){e.prettyPhoto.changePage("previous");e.prettyPhoto.stopSlideshow();return false});$pp_pic_holder.find(".pp_next, .pp_nav .pp_arrow_next").bind("click",function(){e.prettyPhoto.changePage("next");e.prettyPhoto.stopSlideshow();return false});x()}s=jQuery.extend({hook:"rel",animation_speed:"fast",ajaxcallback:function(){},slideshow:5e3,autoplay_slideshow:false,opacity:.8,show_title:true,allow_resize:true,allow_expand:true,default_width:500,default_height:344,counter_separator_label:"/",theme:"pp_default",horizontal_padding:20,hideflash:false,wmode:"opaque",autoplay:true,modal:false,deeplinking:true,overlay_gallery:true,overlay_gallery_max:30,keyboard_shortcuts:true,changepicturecallback:function(){},callback:function(){},ie6_fallback:true,markup:'<div class="pp_pic_holder"> 						<div class="ppt"> </div> 						<div class="pp_top"> 							<div class="pp_left"></div> 							<div class="pp_middle"></div> 							<div class="pp_right"></div> 						</div> 						<div class="pp_content_container"> 							<div class="pp_left"> 							<div class="pp_right"> 								<div class="pp_content"> 									<div class="pp_loaderIcon"></div> 									<div class="pp_fade"> 										<a href="#" class="pp_expand" title="Expand the image">Expand</a> 										<div class="pp_hoverContainer"> 											<a class="pp_next" href="#">next</a> 											<a class="pp_previous" href="#">previous</a> 										</div> 										<div id="pp_full_res"></div> 										<div class="pp_details"> 											<div class="pp_nav"> 												<a href="#" class="pp_arrow_previous">Previous</a> 												<p class="currentTextHolder">0/0</p> 												<a href="#" class="pp_arrow_next">Next</a> 											</div> 											<p class="pp_description"></p> 											<div class="pp_social">{pp_social}</div> 											<a class="pp_close" href="#">Close</a> 										</div> 									</div> 								</div> 							</div> 							</div> 						</div> 						<div class="pp_bottom"> 							<div class="pp_left"></div> 							<div class="pp_middle"></div> 							<div class="pp_right"></div> 						</div> 					</div> 					<div class="pp_overlay"></div>',gallery_markup:'<div class="pp_gallery"> 								<a href="#" class="pp_arrow_previous">Previous</a> 								<div> 									<ul> 										{gallery} 									</ul> 								</div> 								<a href="#" class="pp_arrow_next">Next</a> 							</div>',image_markup:'<img id="fullResImage" src="{path}" />',flash_markup:'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',quicktime_markup:'<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',iframe_markup:'<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',inline_markup:'<div class="pp_inline">{content}</div>',custom_markup:"",social_tools:'<div class="twitter"><a href="http://twitter.com/share" class="twitter-share-button" data-count="none">Tweet</a><script type="text/javascript" src="http://platform.twitter.com/widgets.js"></script></div><div class="facebook"><iframe src="//www.facebook.com/plugins/like.php?locale=en_US&href={location_href}&layout=button_count&show_faces=true&width=500&action=like&font&colorscheme=light&height=23" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:500px; height:23px;" allowTransparency="true"></iframe></div>'},s);var o=this,u=false,a,f,l,c,h,p,d=e(window).height(),v=e(window).width(),m;doresize=true,scroll_pos=T();e(window).unbind("resize.prettyphoto").bind("resize.prettyphoto",function(){x();N()});if(s.keyboard_shortcuts){e(document).unbind("keydown.prettyphoto").bind("keydown.prettyphoto",function(t){if(typeof $pp_pic_holder!="undefined"){if($pp_pic_holder.is(":visible")){switch(t.keyCode){case 37:e.prettyPhoto.changePage("previous");t.preventDefault();break;case 39:e.prettyPhoto.changePage("next");t.preventDefault();break;case 27:if(!settings.modal)e.prettyPhoto.close();t.preventDefault();break}}}})}e.prettyPhoto.initialize=function(){settings=s;if(settings.theme=="pp_default")settings.horizontal_padding=16;theRel=e(this).attr(settings.hook);galleryRegExp=/\[(?:.*)\]/;isSet=galleryRegExp.exec(theRel)?true:false;pp_images=isSet?jQuery.map(o,function(t,n){if(e(t).attr(settings.hook).indexOf(theRel)!=-1)return e(t).attr("href")}):e.makeArray(e(this).attr("href"));pp_titles=isSet?jQuery.map(o,function(t,n){if(e(t).attr(settings.hook).indexOf(theRel)!=-1)return e(t).find("img").attr("alt")?e(t).find("img").attr("alt"):""}):e.makeArray(e(this).find("img").attr("alt"));pp_descriptions=isSet?jQuery.map(o,function(t,n){if(e(t).attr(settings.hook).indexOf(theRel)!=-1)return e(t).attr("title")?e(t).attr("title"):""}):e.makeArray(e(this).attr("title"));if(pp_images.length>settings.overlay_gallery_max)settings.overlay_gallery=false;set_position=jQuery.inArray(e(this).attr("href"),pp_images);rel_index=isSet?set_position:e("a["+settings.hook+"^='"+theRel+"']").index(e(this));k(this);if(settings.allow_resize)e(window).bind("scroll.prettyphoto",function(){x()});e.prettyPhoto.open();return false};e.prettyPhoto.open=function(t){if(typeof settings=="undefined"){settings=s;pp_images=e.makeArray(arguments[0]);pp_titles=arguments[1]?e.makeArray(arguments[1]):e.makeArray("");pp_descriptions=arguments[2]?e.makeArray(arguments[2]):e.makeArray("");isSet=pp_images.length>1?true:false;set_position=arguments[3]?arguments[3]:0;k(t.target)}if(settings.hideflash)e("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility","hidden");b(e(pp_images).size());e(".pp_loaderIcon").show();if(settings.deeplinking)n();if(settings.social_tools){facebook_like_link=settings.social_tools.replace("{location_href}",encodeURIComponent(location.href));$pp_pic_holder.find(".pp_social").html(facebook_like_link)}if($ppt.is(":hidden"))$ppt.css("opacity",0).show();$pp_overlay.show().fadeTo(settings.animation_speed,settings.opacity);$pp_pic_holder.find(".currentTextHolder").text(set_position+1+settings.counter_separator_label+e(pp_images).size());if(typeof pp_descriptions[set_position]!="undefined"&&pp_descriptions[set_position]!=""){$pp_pic_holder.find(".pp_description").show().html(unescape(pp_descriptions[set_position]))}else{$pp_pic_holder.find(".pp_description").hide()}movie_width=parseFloat(i("width",pp_images[set_position]))?i("width",pp_images[set_position]):settings.default_width.toString();movie_height=parseFloat(i("height",pp_images[set_position]))?i("height",pp_images[set_position]):settings.default_height.toString();u=false;if(movie_height.indexOf("%")!=-1){movie_height=parseFloat(e(window).height()*parseFloat(movie_height)/100-150);u=true}if(movie_width.indexOf("%")!=-1){movie_width=parseFloat(e(window).width()*parseFloat(movie_width)/100-150);u=true}$pp_pic_holder.fadeIn(function(){settings.show_title&&pp_titles[set_position]!=""&&typeof pp_titles[set_position]!="undefined"?$ppt.html(unescape(pp_titles[set_position])):$ppt.html(" ");imgPreloader="";skipInjection=false;switch(S(pp_images[set_position])){case"image":imgPreloader=new Image;nextImage=new Image;if(isSet&&set_position<e(pp_images).size()-1)nextImage.src=pp_images[set_position+1];prevImage=new Image;if(isSet&&pp_images[set_position-1])prevImage.src=pp_images[set_position-1];$pp_pic_holder.find("#pp_full_res")[0].innerHTML=settings.image_markup.replace(/{path}/g,pp_images[set_position]);imgPreloader.onload=function(){a=w(imgPreloader.width,imgPreloader.height);g()};imgPreloader.onerror=function(){alert("Image cannot be loaded. Make sure the path is correct and image exist.");e.prettyPhoto.close()};imgPreloader.src=pp_images[set_position];break;case"youtube":a=w(movie_width,movie_height);movie_id=i("v",pp_images[set_position]);if(movie_id==""){movie_id=pp_images[set_position].split("youtu.be/");movie_id=movie_id[1];if(movie_id.indexOf("?")>0)movie_id=movie_id.substr(0,movie_id.indexOf("?"));if(movie_id.indexOf("&")>0)movie_id=movie_id.substr(0,movie_id.indexOf("&"))}movie="http://www.youtube.com/embed/"+movie_id;i("rel",pp_images[set_position])?movie+="?rel="+i("rel",pp_images[set_position]):movie+="?rel=1";if(settings.autoplay)movie+="&autoplay=1";toInject=settings.iframe_markup.replace(/{width}/g,a["width"]).replace(/{height}/g,a["height"]).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,movie);break;case"vimeo":a=w(movie_width,movie_height);movie_id=pp_images[set_position];var t=/http(s?):\/\/(www\.)?vimeo.com\/(\d+)/;var n=movie_id.match(t);movie="http://player.vimeo.com/video/"+n[3]+"?title=0&byline=0&portrait=0";if(settings.autoplay)movie+="&autoplay=1;";vimeo_width=a["width"]+"/embed/?moog_width="+a["width"];toInject=settings.iframe_markup.replace(/{width}/g,vimeo_width).replace(/{height}/g,a["height"]).replace(/{path}/g,movie);break;case"quicktime":a=w(movie_width,movie_height);a["height"]+=15;a["contentHeight"]+=15;a["containerHeight"]+=15;toInject=settings.quicktime_markup.replace(/{width}/g,a["width"]).replace(/{height}/g,a["height"]).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,pp_images[set_position]).replace(/{autoplay}/g,settings.autoplay);break;case"flash":a=w(movie_width,movie_height);flash_vars=pp_images[set_position];flash_vars=flash_vars.substring(pp_images[set_position].indexOf("flashvars")+10,pp_images[set_position].length);filename=pp_images[set_position];filename=filename.substring(0,filename.indexOf("?"));toInject=settings.flash_markup.replace(/{width}/g,a["width"]).replace(/{height}/g,a["height"]).replace(/{wmode}/g,settings.wmode).replace(/{path}/g,filename+"?"+flash_vars);break;case"iframe":a=w(movie_width,movie_height);frame_url=pp_images[set_position];frame_url=frame_url.substr(0,frame_url.indexOf("iframe")-1);toInject=settings.iframe_markup.replace(/{width}/g,a["width"]).replace(/{height}/g,a["height"]).replace(/{path}/g,frame_url);break;case"ajax":doresize=false;a=w(movie_width,movie_height);doresize=true;skipInjection=true;e.get(pp_images[set_position],function(e){toInject=settings.inline_markup.replace(/{content}/g,e);$pp_pic_holder.find("#pp_full_res")[0].innerHTML=toInject;g()});break;case"custom":a=w(movie_width,movie_height);toInject=settings.custom_markup;break;case"inline":myClone=e(pp_images[set_position]).clone().append('<br clear="all" />').css({width:settings.default_width}).wrapInner('<div id="pp_full_res"><div class="pp_inline"></div></div>').appendTo(e("body")).show();doresize=false;a=w(e(myClone).width(),e(myClone).height());doresize=true;e(myClone).remove();toInject=settings.inline_markup.replace(/{content}/g,e(pp_images[set_position]).html());break}if(!imgPreloader&&!skipInjection){$pp_pic_holder.find("#pp_full_res")[0].innerHTML=toInject;g()}});return false};e.prettyPhoto.changePage=function(t){currentGalleryPage=0;if(t=="previous"){set_position--;if(set_position<0)set_position=e(pp_images).size()-1}else if(t=="next"){set_position++;if(set_position>e(pp_images).size()-1)set_position=0}else{set_position=t}rel_index=set_position;if(!doresize)doresize=true;if(settings.allow_expand){e(".pp_contract").removeClass("pp_contract").addClass("pp_expand")}y(function(){e.prettyPhoto.open()})};e.prettyPhoto.changeGalleryPage=function(e){if(e=="next"){currentGalleryPage++;if(currentGalleryPage>totalPage)currentGalleryPage=0}else if(e=="previous"){currentGalleryPage--;if(currentGalleryPage<0)currentGalleryPage=totalPage}else{currentGalleryPage=e}slide_speed=e=="next"||e=="previous"?settings.animation_speed:0;slide_to=currentGalleryPage*itemsPerPage*itemWidth;$pp_gallery.find("ul").animate({left:-slide_to},slide_speed)};e.prettyPhoto.startSlideshow=function(){if(typeof m=="undefined"){$pp_pic_holder.find(".pp_play").unbind("click").removeClass("pp_play").addClass("pp_pause").click(function(){e.prettyPhoto.stopSlideshow();return false});m=setInterval(e.prettyPhoto.startSlideshow,settings.slideshow)}else{e.prettyPhoto.changePage("next")}};e.prettyPhoto.stopSlideshow=function(){$pp_pic_holder.find(".pp_pause").unbind("click").removeClass("pp_pause").addClass("pp_play").click(function(){e.prettyPhoto.startSlideshow();return false});clearInterval(m);m=undefined};e.prettyPhoto.close=function(){if($pp_overlay.is(":animated"))return;e.prettyPhoto.stopSlideshow();$pp_pic_holder.stop().find("object,embed").css("visibility","hidden");e("div.pp_pic_holder,div.ppt,.pp_fade").fadeOut(settings.animation_speed,function(){e(this).remove()});$pp_overlay.fadeOut(settings.animation_speed,function(){if(settings.hideflash)e("object,embed,iframe[src*=youtube],iframe[src*=vimeo]").css("visibility","visible");e(this).remove();e(window).unbind("scroll.prettyphoto");r();settings.callback();doresize=true;f=false;delete settings})};if(!pp_alreadyInitialized&&t()){pp_alreadyInitialized=true;hashIndex=t();hashRel=hashIndex;hashIndex=hashIndex.substring(hashIndex.indexOf("/")+1,hashIndex.length-1);hashRel=hashRel.substring(0,hashRel.indexOf("/"));setTimeout(function(){e("a["+s.hook+"^='"+hashRel+"']:eq("+hashIndex+")").trigger("click")},50)}return this.unbind("click.prettyphoto").bind("click.prettyphoto",e.prettyPhoto.initialize)};})(jQuery);var pp_alreadyInitialized=false

function main() {

(function () {
   'use strict';
   
   // Testimonial slider
  	$('a.page-scroll').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var target = $(this.hash);
          target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
          if (target.length) {
            $('html,body').animate({
              scrollTop: target.offset().top - 40
            }, 900);
            return false;
          }
        }
      });

  	$(document).ready(function() {
  	    $("#testimonial").owlCarousel({
        navigation : false, // Show next and prev buttons
        slideSpeed : 300,
        paginationSpeed : 400,
        singleItem:true
        });

  	});
	

  	// Portfolio isotope filter
    $(window).load(function() {
        var $container = $('.project-items');
        $container.isotope({
            filter: '*',
            animationOptions: {
                duration: 750,
                easing: 'linear',
                queue: false
            }
        });
        $('.cat a').click(function() {
            $('.cat .active').removeClass('active');
            $(this).addClass('active');
            var selector = $(this).attr('data-filter');
            $container.isotope({
                filter: selector,
                animationOptions: {
                    duration: 750,
                    easing: 'linear',
                    queue: false
                }
            });
            
            return false;
        });

    });
	

  	// Pretty Photo
	$("a[rel^='prettyPhoto']").prettyPhoto({
		social_tools: false
	});	

}());


}
main();
/*
 *  jQuery OwlCarousel v1.3.2
 *
 *  Copyright (c) 2013 Bartosz Wojciechowski
 *  http://www.owlgraphic.com/owlcarousel/
 *
 *  Licensed under MIT
 *
 */

/*JS Lint helpers: */
/*global dragMove: false, dragEnd: false, $, jQuery, alert, window, document */
/*jslint nomen: true, continue:true */

if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function ($, window, document) {

    var Carousel = {
        init : function (options, el) {
            var base = this;

            base.$elem = $(el);
            base.options = $.extend({}, $.fn.owlCarousel.options, base.$elem.data(), options);

            base.userOptions = options;
            base.loadContent();
        },

        loadContent : function () {
            var base = this, url;

            function getData(data) {
                var i, content = "";
                if (typeof base.options.jsonSuccess === "function") {
                    base.options.jsonSuccess.apply(this, [data]);
                } else {
                    for (i in data.owl) {
                        if (data.owl.hasOwnProperty(i)) {
                            content += data.owl[i].item;
                        }
                    }
                    base.$elem.html(content);
                }
                base.logIn();
            }

            if (typeof base.options.beforeInit === "function") {
                base.options.beforeInit.apply(this, [base.$elem]);
            }

            if (typeof base.options.jsonPath === "string") {
                url = base.options.jsonPath;
                $.getJSON(url, getData);
            } else {
                base.logIn();
            }
        },

        logIn : function () {
            var base = this;

            base.$elem.data("owl-originalStyles", base.$elem.attr("style"))
                      .data("owl-originalClasses", base.$elem.attr("class"));

            base.$elem.css({opacity: 0});
            base.orignalItems = base.options.items;
            base.checkBrowser();
            base.wrapperWidth = 0;
            base.checkVisible = null;
            base.setVars();
        },

        setVars : function () {
            var base = this;
            if (base.$elem.children().length === 0) {return false; }
            base.baseClass();
            base.eventTypes();
            base.$userItems = base.$elem.children();
            base.itemsAmount = base.$userItems.length;
            base.wrapItems();
            base.$owlItems = base.$elem.find(".owl-item");
            base.$owlWrapper = base.$elem.find(".owl-wrapper");
            base.playDirection = "next";
            base.prevItem = 0;
            base.prevArr = [0];
            base.currentItem = 0;
            base.customEvents();
            base.onStartup();
        },

        onStartup : function () {
            var base = this;
            base.updateItems();
            base.calculateAll();
            base.buildControls();
            base.updateControls();
            base.response();
            base.moveEvents();
            base.stopOnHover();
            base.owlStatus();

            if (base.options.transitionStyle !== false) {
                base.transitionTypes(base.options.transitionStyle);
            }
            if (base.options.autoPlay === true) {
                base.options.autoPlay = 5000;
            }
            base.play();

            base.$elem.find(".owl-wrapper").css("display", "block");

            if (!base.$elem.is(":visible")) {
                base.watchVisibility();
            } else {
                base.$elem.css("opacity", 1);
            }
            base.onstartup = false;
            base.eachMoveUpdate();
            if (typeof base.options.afterInit === "function") {
                base.options.afterInit.apply(this, [base.$elem]);
            }
        },

        eachMoveUpdate : function () {
            var base = this;

            if (base.options.lazyLoad === true) {
                base.lazyLoad();
            }
            if (base.options.autoHeight === true) {
                base.autoHeight();
            }
            base.onVisibleItems();

            if (typeof base.options.afterAction === "function") {
                base.options.afterAction.apply(this, [base.$elem]);
            }
        },

        updateVars : function () {
            var base = this;
            if (typeof base.options.beforeUpdate === "function") {
                base.options.beforeUpdate.apply(this, [base.$elem]);
            }
            base.watchVisibility();
            base.updateItems();
            base.calculateAll();
            base.updatePosition();
            base.updateControls();
            base.eachMoveUpdate();
            if (typeof base.options.afterUpdate === "function") {
                base.options.afterUpdate.apply(this, [base.$elem]);
            }
        },

        reload : function () {
            var base = this;
            window.setTimeout(function () {
                base.updateVars();
            }, 0);
        },

        watchVisibility : function () {
            var base = this;

            if (base.$elem.is(":visible") === false) {
                base.$elem.css({opacity: 0});
                window.clearInterval(base.autoPlayInterval);
                window.clearInterval(base.checkVisible);
            } else {
                return false;
            }
            base.checkVisible = window.setInterval(function () {
                if (base.$elem.is(":visible")) {
                    base.reload();
                    base.$elem.animate({opacity: 1}, 200);
                    window.clearInterval(base.checkVisible);
                }
            }, 500);
        },

        wrapItems : function () {
            var base = this;
            base.$userItems.wrapAll("<div class=\"owl-wrapper\">").wrap("<div class=\"owl-item\"></div>");
            base.$elem.find(".owl-wrapper").wrap("<div class=\"owl-wrapper-outer\">");
            base.wrapperOuter = base.$elem.find(".owl-wrapper-outer");
            base.$elem.css("display", "block");
        },

        baseClass : function () {
            var base = this,
                hasBaseClass = base.$elem.hasClass(base.options.baseClass),
                hasThemeClass = base.$elem.hasClass(base.options.theme);

            if (!hasBaseClass) {
                base.$elem.addClass(base.options.baseClass);
            }

            if (!hasThemeClass) {
                base.$elem.addClass(base.options.theme);
            }
        },

        updateItems : function () {
            var base = this, width, i;

            if (base.options.responsive === false) {
                return false;
            }
            if (base.options.singleItem === true) {
                base.options.items = base.orignalItems = 1;
                base.options.itemsCustom = false;
                base.options.itemsDesktop = false;
                base.options.itemsDesktopSmall = false;
                base.options.itemsTablet = false;
                base.options.itemsTabletSmall = false;
                base.options.itemsMobile = false;
                return false;
            }

            width = $(base.options.responsiveBaseWidth).width();

            if (width > (base.options.itemsDesktop[0] || base.orignalItems)) {
                base.options.items = base.orignalItems;
            }
            if (base.options.itemsCustom !== false) {
                //Reorder array by screen size
                base.options.itemsCustom.sort(function (a, b) {return a[0] - b[0]; });

                for (i = 0; i < base.options.itemsCustom.length; i += 1) {
                    if (base.options.itemsCustom[i][0] <= width) {
                        base.options.items = base.options.itemsCustom[i][1];
                    }
                }

            } else {

                if (width <= base.options.itemsDesktop[0] && base.options.itemsDesktop !== false) {
                    base.options.items = base.options.itemsDesktop[1];
                }

                if (width <= base.options.itemsDesktopSmall[0] && base.options.itemsDesktopSmall !== false) {
                    base.options.items = base.options.itemsDesktopSmall[1];
                }

                if (width <= base.options.itemsTablet[0] && base.options.itemsTablet !== false) {
                    base.options.items = base.options.itemsTablet[1];
                }

                if (width <= base.options.itemsTabletSmall[0] && base.options.itemsTabletSmall !== false) {
                    base.options.items = base.options.itemsTabletSmall[1];
                }

                if (width <= base.options.itemsMobile[0] && base.options.itemsMobile !== false) {
                    base.options.items = base.options.itemsMobile[1];
                }
            }

            //if number of items is less than declared
            if (base.options.items > base.itemsAmount && base.options.itemsScaleUp === true) {
                base.options.items = base.itemsAmount;
            }
        },

        response : function () {
            var base = this,
                smallDelay,
                lastWindowWidth;

            if (base.options.responsive !== true) {
                return false;
            }
            lastWindowWidth = $(window).width();

            base.resizer = function () {
                if ($(window).width() !== lastWindowWidth) {
                    if (base.options.autoPlay !== false) {
                        window.clearInterval(base.autoPlayInterval);
                    }
                    window.clearTimeout(smallDelay);
                    smallDelay = window.setTimeout(function () {
                        lastWindowWidth = $(window).width();
                        base.updateVars();
                    }, base.options.responsiveRefreshRate);
                }
            };
            $(window).resize(base.resizer);
        },

        updatePosition : function () {
            var base = this;
            base.jumpTo(base.currentItem);
            if (base.options.autoPlay !== false) {
                base.checkAp();
            }
        },

        appendItemsSizes : function () {
            var base = this,
                roundPages = 0,
                lastItem = base.itemsAmount - base.options.items;

            base.$owlItems.each(function (index) {
                var $this = $(this);
                $this
                    .css({"width": base.itemWidth})
                    .data("owl-item", Number(index));

                if (index % base.options.items === 0 || index === lastItem) {
                    if (!(index > lastItem)) {
                        roundPages += 1;
                    }
                }
                $this.data("owl-roundPages", roundPages);
            });
        },

        appendWrapperSizes : function () {
            var base = this,
                width = base.$owlItems.length * base.itemWidth;

            base.$owlWrapper.css({
                "width": width * 2,
                "left": 0
            });
            base.appendItemsSizes();
        },

        calculateAll : function () {
            var base = this;
            base.calculateWidth();
            base.appendWrapperSizes();
            base.loops();
            base.max();
        },

        calculateWidth : function () {
            var base = this;
            base.itemWidth = Math.round(base.$elem.width() / base.options.items);
        },

        max : function () {
            var base = this,
                maximum = ((base.itemsAmount * base.itemWidth) - base.options.items * base.itemWidth) * -1;
            if (base.options.items > base.itemsAmount) {
                base.maximumItem = 0;
                maximum = 0;
                base.maximumPixels = 0;
            } else {
                base.maximumItem = base.itemsAmount - base.options.items;
                base.maximumPixels = maximum;
            }
            return maximum;
        },

        min : function () {
            return 0;
        },

        loops : function () {
            var base = this,
                prev = 0,
                elWidth = 0,
                i,
                item,
                roundPageNum;

            base.positionsInArray = [0];
            base.pagesInArray = [];

            for (i = 0; i < base.itemsAmount; i += 1) {
                elWidth += base.itemWidth;
                base.positionsInArray.push(-elWidth);

                if (base.options.scrollPerPage === true) {
                    item = $(base.$owlItems[i]);
                    roundPageNum = item.data("owl-roundPages");
                    if (roundPageNum !== prev) {
                        base.pagesInArray[prev] = base.positionsInArray[i];
                        prev = roundPageNum;
                    }
                }
            }
        },

        buildControls : function () {
            var base = this;
            if (base.options.navigation === true || base.options.pagination === true) {
                base.owlControls = $("<div class=\"owl-controls\"/>").toggleClass("clickable", !base.browser.isTouch).appendTo(base.$elem);
            }
            if (base.options.pagination === true) {
                base.buildPagination();
            }
            if (base.options.navigation === true) {
                base.buildButtons();
            }
        },

        buildButtons : function () {
            var base = this,
                buttonsWrapper = $("<div class=\"owl-buttons\"/>");
            base.owlControls.append(buttonsWrapper);

            base.buttonPrev = $("<div/>", {
                "class" : "owl-prev",
                "html" : base.options.navigationText[0] || ""
            });

            base.buttonNext = $("<div/>", {
                "class" : "owl-next",
                "html" : base.options.navigationText[1] || ""
            });

            buttonsWrapper
                .append(base.buttonPrev)
                .append(base.buttonNext);

            buttonsWrapper.on("touchstart.owlControls mousedown.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
            });

            buttonsWrapper.on("touchend.owlControls mouseup.owlControls", "div[class^=\"owl\"]", function (event) {
                event.preventDefault();
                if ($(this).hasClass("owl-next")) {
                    base.next();
                } else {
                    base.prev();
                }
            });
        },

        buildPagination : function () {
            var base = this;

            base.paginationWrapper = $("<div class=\"owl-pagination\"/>");
            base.owlControls.append(base.paginationWrapper);

            base.paginationWrapper.on("touchend.owlControls mouseup.owlControls", ".owl-page", function (event) {
                event.preventDefault();
                if (Number($(this).data("owl-page")) !== base.currentItem) {
                    base.goTo(Number($(this).data("owl-page")), true);
                }
            });
        },

        updatePagination : function () {
            var base = this,
                counter,
                lastPage,
                lastItem,
                i,
                paginationButton,
                paginationButtonInner;

            if (base.options.pagination === false) {
                return false;
            }

            base.paginationWrapper.html("");

            counter = 0;
            lastPage = base.itemsAmount - base.itemsAmount % base.options.items;

            for (i = 0; i < base.itemsAmount; i += 1) {
                if (i % base.options.items === 0) {
                    counter += 1;
                    if (lastPage === i) {
                        lastItem = base.itemsAmount - base.options.items;
                    }
                    paginationButton = $("<div/>", {
                        "class" : "owl-page"
                    });
                    paginationButtonInner = $("<span></span>", {
                        "text": base.options.paginationNumbers === true ? counter : "",
                        "class": base.options.paginationNumbers === true ? "owl-numbers" : ""
                    });
                    paginationButton.append(paginationButtonInner);

                    paginationButton.data("owl-page", lastPage === i ? lastItem : i);
                    paginationButton.data("owl-roundPages", counter);

                    base.paginationWrapper.append(paginationButton);
                }
            }
            base.checkPagination();
        },
        checkPagination : function () {
            var base = this;
            if (base.options.pagination === false) {
                return false;
            }
            base.paginationWrapper.find(".owl-page").each(function () {
                if ($(this).data("owl-roundPages") === $(base.$owlItems[base.currentItem]).data("owl-roundPages")) {
                    base.paginationWrapper
                        .find(".owl-page")
                        .removeClass("active");
                    $(this).addClass("active");
                }
            });
        },

        checkNavigation : function () {
            var base = this;

            if (base.options.navigation === false) {
                return false;
            }
            if (base.options.rewindNav === false) {
                if (base.currentItem === 0 && base.maximumItem === 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem === 0 && base.maximumItem !== 0) {
                    base.buttonPrev.addClass("disabled");
                    base.buttonNext.removeClass("disabled");
                } else if (base.currentItem === base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.addClass("disabled");
                } else if (base.currentItem !== 0 && base.currentItem !== base.maximumItem) {
                    base.buttonPrev.removeClass("disabled");
                    base.buttonNext.removeClass("disabled");
                }
            }
        },

        updateControls : function () {
            var base = this;
            base.updatePagination();
            base.checkNavigation();
            if (base.owlControls) {
                if (base.options.items >= base.itemsAmount) {
                    base.owlControls.hide();
                } else {
                    base.owlControls.show();
                }
            }
        },

        destroyControls : function () {
            var base = this;
            if (base.owlControls) {
                base.owlControls.remove();
            }
        },

        next : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            base.currentItem += base.options.scrollPerPage === true ? base.options.items : 1;
            if (base.currentItem > base.maximumItem + (base.options.scrollPerPage === true ? (base.options.items - 1) : 0)) {
                if (base.options.rewindNav === true) {
                    base.currentItem = 0;
                    speed = "rewind";
                } else {
                    base.currentItem = base.maximumItem;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        prev : function (speed) {
            var base = this;

            if (base.isTransition) {
                return false;
            }

            if (base.options.scrollPerPage === true && base.currentItem > 0 && base.currentItem < base.options.items) {
                base.currentItem = 0;
            } else {
                base.currentItem -= base.options.scrollPerPage === true ? base.options.items : 1;
            }
            if (base.currentItem < 0) {
                if (base.options.rewindNav === true) {
                    base.currentItem = base.maximumItem;
                    speed = "rewind";
                } else {
                    base.currentItem = 0;
                    return false;
                }
            }
            base.goTo(base.currentItem, speed);
        },

        goTo : function (position, speed, drag) {
            var base = this,
                goToPixel;

            if (base.isTransition) {
                return false;
            }
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }

            base.currentItem = base.owl.currentItem = position;
            if (base.options.transitionStyle !== false && drag !== "drag" && base.options.items === 1 && base.browser.support3d === true) {
                base.swapSpeed(0);
                if (base.browser.support3d === true) {
                    base.transition3d(base.positionsInArray[position]);
                } else {
                    base.css2slide(base.positionsInArray[position], 1);
                }
                base.afterGo();
                base.singleItemTransition();
                return false;
            }
            goToPixel = base.positionsInArray[position];

            if (base.browser.support3d === true) {
                base.isCss3Finish = false;

                if (speed === true) {
                    base.swapSpeed("paginationSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.paginationSpeed);

                } else if (speed === "rewind") {
                    base.swapSpeed(base.options.rewindSpeed);
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.rewindSpeed);

                } else {
                    base.swapSpeed("slideSpeed");
                    window.setTimeout(function () {
                        base.isCss3Finish = true;
                    }, base.options.slideSpeed);
                }
                base.transition3d(goToPixel);
            } else {
                if (speed === true) {
                    base.css2slide(goToPixel, base.options.paginationSpeed);
                } else if (speed === "rewind") {
                    base.css2slide(goToPixel, base.options.rewindSpeed);
                } else {
                    base.css2slide(goToPixel, base.options.slideSpeed);
                }
            }
            base.afterGo();
        },

        jumpTo : function (position) {
            var base = this;
            if (typeof base.options.beforeMove === "function") {
                base.options.beforeMove.apply(this, [base.$elem]);
            }
            if (position >= base.maximumItem || position === -1) {
                position = base.maximumItem;
            } else if (position <= 0) {
                position = 0;
            }
            base.swapSpeed(0);
            if (base.browser.support3d === true) {
                base.transition3d(base.positionsInArray[position]);
            } else {
                base.css2slide(base.positionsInArray[position], 1);
            }
            base.currentItem = base.owl.currentItem = position;
            base.afterGo();
        },

        afterGo : function () {
            var base = this;

            base.prevArr.push(base.currentItem);
            base.prevItem = base.owl.prevItem = base.prevArr[base.prevArr.length - 2];
            base.prevArr.shift(0);

            if (base.prevItem !== base.currentItem) {
                base.checkPagination();
                base.checkNavigation();
                base.eachMoveUpdate();

                if (base.options.autoPlay !== false) {
                    base.checkAp();
                }
            }
            if (typeof base.options.afterMove === "function" && base.prevItem !== base.currentItem) {
                base.options.afterMove.apply(this, [base.$elem]);
            }
        },

        stop : function () {
            var base = this;
            base.apStatus = "stop";
            window.clearInterval(base.autoPlayInterval);
        },

        checkAp : function () {
            var base = this;
            if (base.apStatus !== "stop") {
                base.play();
            }
        },

        play : function () {
            var base = this;
            base.apStatus = "play";
            if (base.options.autoPlay === false) {
                return false;
            }
            window.clearInterval(base.autoPlayInterval);
            base.autoPlayInterval = window.setInterval(function () {
                base.next(true);
            }, base.options.autoPlay);
        },

        swapSpeed : function (action) {
            var base = this;
            if (action === "slideSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.slideSpeed));
            } else if (action === "paginationSpeed") {
                base.$owlWrapper.css(base.addCssSpeed(base.options.paginationSpeed));
            } else if (typeof action !== "string") {
                base.$owlWrapper.css(base.addCssSpeed(action));
            }
        },

        addCssSpeed : function (speed) {
            return {
                "-webkit-transition": "all " + speed + "ms ease",
                "-moz-transition": "all " + speed + "ms ease",
                "-o-transition": "all " + speed + "ms ease",
                "transition": "all " + speed + "ms ease"
            };
        },

        removeTransition : function () {
            return {
                "-webkit-transition": "",
                "-moz-transition": "",
                "-o-transition": "",
                "transition": ""
            };
        },

        doTranslate : function (pixels) {
            return {
                "-webkit-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-moz-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-o-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "-ms-transform": "translate3d(" + pixels + "px, 0px, 0px)",
                "transform": "translate3d(" + pixels + "px, 0px,0px)"
            };
        },

        transition3d : function (value) {
            var base = this;
            base.$owlWrapper.css(base.doTranslate(value));
        },

        css2move : function (value) {
            var base = this;
            base.$owlWrapper.css({"left" : value});
        },

        css2slide : function (value, speed) {
            var base = this;

            base.isCssFinish = false;
            base.$owlWrapper.stop(true, true).animate({
                "left" : value
            }, {
                duration : speed || base.options.slideSpeed,
                complete : function () {
                    base.isCssFinish = true;
                }
            });
        },

        checkBrowser : function () {
            var base = this,
                translate3D = "translate3d(0px, 0px, 0px)",
                tempElem = document.createElement("div"),
                regex,
                asSupport,
                support3d,
                isTouch;

            tempElem.style.cssText = "  -moz-transform:" + translate3D +
                                  "; -ms-transform:"     + translate3D +
                                  "; -o-transform:"      + translate3D +
                                  "; -webkit-transform:" + translate3D +
                                  "; transform:"         + translate3D;
            regex = /translate3d\(0px, 0px, 0px\)/g;
            asSupport = tempElem.style.cssText.match(regex);
            support3d = (asSupport !== null && asSupport.length === 1);

            isTouch = "ontouchstart" in window || window.navigator.msMaxTouchPoints;

            base.browser = {
                "support3d" : support3d,
                "isTouch" : isTouch
            };
        },

        moveEvents : function () {
            var base = this;
            if (base.options.mouseDrag !== false || base.options.touchDrag !== false) {
                base.gestures();
                base.disabledEvents();
            }
        },

        eventTypes : function () {
            var base = this,
                types = ["s", "e", "x"];

            base.ev_types = {};

            if (base.options.mouseDrag === true && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl mousedown.owl",
                    "touchmove.owl mousemove.owl",
                    "touchend.owl touchcancel.owl mouseup.owl"
                ];
            } else if (base.options.mouseDrag === false && base.options.touchDrag === true) {
                types = [
                    "touchstart.owl",
                    "touchmove.owl",
                    "touchend.owl touchcancel.owl"
                ];
            } else if (base.options.mouseDrag === true && base.options.touchDrag === false) {
                types = [
                    "mousedown.owl",
                    "mousemove.owl",
                    "mouseup.owl"
                ];
            }

            base.ev_types.start = types[0];
            base.ev_types.move = types[1];
            base.ev_types.end = types[2];
        },

        disabledEvents :  function () {
            var base = this;
            base.$elem.on("dragstart.owl", function (event) { event.preventDefault(); });
            base.$elem.on("mousedown.disableTextSelect", function (e) {
                return $(e.target).is('input, textarea, select, option');
            });
        },

        gestures : function () {
            /*jslint unparam: true*/
            var base = this,
                locals = {
                    offsetX : 0,
                    offsetY : 0,
                    baseElWidth : 0,
                    relativePos : 0,
                    position: null,
                    minSwipe : null,
                    maxSwipe: null,
                    sliding : null,
                    dargging: null,
                    targetElement : null
                };

            base.isCssFinish = true;

            function getTouches(event) {
                if (event.touches !== undefined) {
                    return {
                        x : event.touches[0].pageX,
                        y : event.touches[0].pageY
                    };
                }

                if (event.touches === undefined) {
                    if (event.pageX !== undefined) {
                        return {
                            x : event.pageX,
                            y : event.pageY
                        };
                    }
                    if (event.pageX === undefined) {
                        return {
                            x : event.clientX,
                            y : event.clientY
                        };
                    }
                }
            }

            function swapEvents(type) {
                if (type === "on") {
                    $(document).on(base.ev_types.move, dragMove);
                    $(document).on(base.ev_types.end, dragEnd);
                } else if (type === "off") {
                    $(document).off(base.ev_types.move);
                    $(document).off(base.ev_types.end);
                }
            }

            function dragStart(event) {
                var ev = event.originalEvent || event || window.event,
                    position;

                if (ev.which === 3) {
                    return false;
                }
                if (base.itemsAmount <= base.options.items) {
                    return;
                }
                if (base.isCssFinish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }
                if (base.isCss3Finish === false && !base.options.dragBeforeAnimFinish) {
                    return false;
                }

                if (base.options.autoPlay !== false) {
                    window.clearInterval(base.autoPlayInterval);
                }

                if (base.browser.isTouch !== true && !base.$owlWrapper.hasClass("grabbing")) {
                    base.$owlWrapper.addClass("grabbing");
                }

                base.newPosX = 0;
                base.newRelativeX = 0;

                $(this).css(base.removeTransition());

                position = $(this).position();
                locals.relativePos = position.left;

                locals.offsetX = getTouches(ev).x - position.left;
                locals.offsetY = getTouches(ev).y - position.top;

                swapEvents("on");

                locals.sliding = false;
                locals.targetElement = ev.target || ev.srcElement;
            }

            function dragMove(event) {
                var ev = event.originalEvent || event || window.event,
                    minSwipe,
                    maxSwipe;

                base.newPosX = getTouches(ev).x - locals.offsetX;
                base.newPosY = getTouches(ev).y - locals.offsetY;
                base.newRelativeX = base.newPosX - locals.relativePos;

                if (typeof base.options.startDragging === "function" && locals.dragging !== true && base.newRelativeX !== 0) {
                    locals.dragging = true;
                    base.options.startDragging.apply(base, [base.$elem]);
                }

                if ((base.newRelativeX > 8 || base.newRelativeX < -8) && (base.browser.isTouch === true)) {
                    if (ev.preventDefault !== undefined) {
                        ev.preventDefault();
                    } else {
                        ev.returnValue = false;
                    }
                    locals.sliding = true;
                }

                if ((base.newPosY > 10 || base.newPosY < -10) && locals.sliding === false) {
                    $(document).off("touchmove.owl");
                }

                minSwipe = function () {
                    return base.newRelativeX / 5;
                };

                maxSwipe = function () {
                    return base.maximumPixels + base.newRelativeX / 5;
                };

                base.newPosX = Math.max(Math.min(base.newPosX, minSwipe()), maxSwipe());
                if (base.browser.support3d === true) {
                    base.transition3d(base.newPosX);
                } else {
                    base.css2move(base.newPosX);
                }
            }

            function dragEnd(event) {
                var ev = event.originalEvent || event || window.event,
                    newPosition,
                    handlers,
                    owlStopEvent;

                ev.target = ev.target || ev.srcElement;

                locals.dragging = false;

                if (base.browser.isTouch !== true) {
                    base.$owlWrapper.removeClass("grabbing");
                }

                if (base.newRelativeX < 0) {
                    base.dragDirection = base.owl.dragDirection = "left";
                } else {
                    base.dragDirection = base.owl.dragDirection = "right";
                }

                if (base.newRelativeX !== 0) {
                    newPosition = base.getNewPosition();
                    base.goTo(newPosition, false, "drag");
                    if (locals.targetElement === ev.target && base.browser.isTouch !== true) {
                        $(ev.target).on("click.disable", function (ev) {
                            ev.stopImmediatePropagation();
                            ev.stopPropagation();
                            ev.preventDefault();
                            $(ev.target).off("click.disable");
                        });
                        handlers = $._data(ev.target, "events").click;
                        owlStopEvent = handlers.pop();
                        handlers.splice(0, 0, owlStopEvent);
                    }
                }
                swapEvents("off");
            }
            base.$elem.on(base.ev_types.start, ".owl-wrapper", dragStart);
        },

        getNewPosition : function () {
            var base = this,
                newPosition = base.closestItem();

            if (newPosition > base.maximumItem) {
                base.currentItem = base.maximumItem;
                newPosition  = base.maximumItem;
            } else if (base.newPosX >= 0) {
                newPosition = 0;
                base.currentItem = 0;
            }
            return newPosition;
        },
        closestItem : function () {
            var base = this,
                array = base.options.scrollPerPage === true ? base.pagesInArray : base.positionsInArray,
                goal = base.newPosX,
                closest = null;

            $.each(array, function (i, v) {
                if (goal - (base.itemWidth / 20) > array[i + 1] && goal - (base.itemWidth / 20) < v && base.moveDirection() === "left") {
                    closest = v;
                    if (base.options.scrollPerPage === true) {
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        base.currentItem = i;
                    }
                } else if (goal + (base.itemWidth / 20) < v && goal + (base.itemWidth / 20) > (array[i + 1] || array[i] - base.itemWidth) && base.moveDirection() === "right") {
                    if (base.options.scrollPerPage === true) {
                        closest = array[i + 1] || array[array.length - 1];
                        base.currentItem = $.inArray(closest, base.positionsInArray);
                    } else {
                        closest = array[i + 1];
                        base.currentItem = i + 1;
                    }
                }
            });
            return base.currentItem;
        },

        moveDirection : function () {
            var base = this,
                direction;
            if (base.newRelativeX < 0) {
                direction = "right";
                base.playDirection = "next";
            } else {
                direction = "left";
                base.playDirection = "prev";
            }
            return direction;
        },

        customEvents : function () {
            /*jslint unparam: true*/
            var base = this;
            base.$elem.on("owl.next", function () {
                base.next();
            });
            base.$elem.on("owl.prev", function () {
                base.prev();
            });
            base.$elem.on("owl.play", function (event, speed) {
                base.options.autoPlay = speed;
                base.play();
                base.hoverStatus = "play";
            });
            base.$elem.on("owl.stop", function () {
                base.stop();
                base.hoverStatus = "stop";
            });
            base.$elem.on("owl.goTo", function (event, item) {
                base.goTo(item);
            });
            base.$elem.on("owl.jumpTo", function (event, item) {
                base.jumpTo(item);
            });
        },

        stopOnHover : function () {
            var base = this;
            if (base.options.stopOnHover === true && base.browser.isTouch !== true && base.options.autoPlay !== false) {
                base.$elem.on("mouseover", function () {
                    base.stop();
                });
                base.$elem.on("mouseout", function () {
                    if (base.hoverStatus !== "stop") {
                        base.play();
                    }
                });
            }
        },

        lazyLoad : function () {
            var base = this,
                i,
                $item,
                itemNumber,
                $lazyImg,
                follow;

            if (base.options.lazyLoad === false) {
                return false;
            }
            for (i = 0; i < base.itemsAmount; i += 1) {
                $item = $(base.$owlItems[i]);

                if ($item.data("owl-loaded") === "loaded") {
                    continue;
                }

                itemNumber = $item.data("owl-item");
                $lazyImg = $item.find(".lazyOwl");

                if (typeof $lazyImg.data("src") !== "string") {
                    $item.data("owl-loaded", "loaded");
                    continue;
                }
                if ($item.data("owl-loaded") === undefined) {
                    $lazyImg.hide();
                    $item.addClass("loading").data("owl-loaded", "checked");
                }
                if (base.options.lazyFollow === true) {
                    follow = itemNumber >= base.currentItem;
                } else {
                    follow = true;
                }
                if (follow && itemNumber < base.currentItem + base.options.items && $lazyImg.length) {
                    base.lazyPreload($item, $lazyImg);
                }
            }
        },

        lazyPreload : function ($item, $lazyImg) {
            var base = this,
                iterations = 0,
                isBackgroundImg;

            if ($lazyImg.prop("tagName") === "DIV") {
                $lazyImg.css("background-image", "url(" + $lazyImg.data("src") + ")");
                isBackgroundImg = true;
            } else {
                $lazyImg[0].src = $lazyImg.data("src");
            }

            function showImage() {
                $item.data("owl-loaded", "loaded").removeClass("loading");
                $lazyImg.removeAttr("data-src");
                if (base.options.lazyEffect === "fade") {
                    $lazyImg.fadeIn(400);
                } else {
                    $lazyImg.show();
                }
                if (typeof base.options.afterLazyLoad === "function") {
                    base.options.afterLazyLoad.apply(this, [base.$elem]);
                }
            }

            function checkLazyImage() {
                iterations += 1;
                if (base.completeImg($lazyImg.get(0)) || isBackgroundImg === true) {
                    showImage();
                } else if (iterations <= 100) {//if image loads in less than 10 seconds 
                    window.setTimeout(checkLazyImage, 100);
                } else {
                    showImage();
                }
            }

            checkLazyImage();
        },

        autoHeight : function () {
            var base = this,
                $currentimg = $(base.$owlItems[base.currentItem]).find("img"),
                iterations;

            function addHeight() {
                var $currentItem = $(base.$owlItems[base.currentItem]).height();
                base.wrapperOuter.css("height", $currentItem + "px");
                if (!base.wrapperOuter.hasClass("autoHeight")) {
                    window.setTimeout(function () {
                        base.wrapperOuter.addClass("autoHeight");
                    }, 0);
                }
            }

            function checkImage() {
                iterations += 1;
                if (base.completeImg($currentimg.get(0))) {
                    addHeight();
                } else if (iterations <= 100) { //if image loads in less than 10 seconds 
                    window.setTimeout(checkImage, 100);
                } else {
                    base.wrapperOuter.css("height", ""); //Else remove height attribute
                }
            }

            if ($currentimg.get(0) !== undefined) {
                iterations = 0;
                checkImage();
            } else {
                addHeight();
            }
        },

        completeImg : function (img) {
            var naturalWidthType;

            if (!img.complete) {
                return false;
            }
            naturalWidthType = typeof img.naturalWidth;
            if (naturalWidthType !== "undefined" && img.naturalWidth === 0) {
                return false;
            }
            return true;
        },

        onVisibleItems : function () {
            var base = this,
                i;

            if (base.options.addClassActive === true) {
                base.$owlItems.removeClass("active");
            }
            base.visibleItems = [];
            for (i = base.currentItem; i < base.currentItem + base.options.items; i += 1) {
                base.visibleItems.push(i);

                if (base.options.addClassActive === true) {
                    $(base.$owlItems[i]).addClass("active");
                }
            }
            base.owl.visibleItems = base.visibleItems;
        },

        transitionTypes : function (className) {
            var base = this;
            //Currently available: "fade", "backSlide", "goDown", "fadeUp"
            base.outClass = "owl-" + className + "-out";
            base.inClass = "owl-" + className + "-in";
        },

        singleItemTransition : function () {
            var base = this,
                outClass = base.outClass,
                inClass = base.inClass,
                $currentItem = base.$owlItems.eq(base.currentItem),
                $prevItem = base.$owlItems.eq(base.prevItem),
                prevPos = Math.abs(base.positionsInArray[base.currentItem]) + base.positionsInArray[base.prevItem],
                origin = Math.abs(base.positionsInArray[base.currentItem]) + base.itemWidth / 2,
                animEnd = 'webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend';

            base.isTransition = true;

            base.$owlWrapper
                .addClass('owl-origin')
                .css({
                    "-webkit-transform-origin" : origin + "px",
                    "-moz-perspective-origin" : origin + "px",
                    "perspective-origin" : origin + "px"
                });
            function transStyles(prevPos) {
                return {
                    "position" : "relative",
                    "left" : prevPos + "px"
                };
            }

            $prevItem
                .css(transStyles(prevPos, 10))
                .addClass(outClass)
                .on(animEnd, function () {
                    base.endPrev = true;
                    $prevItem.off(animEnd);
                    base.clearTransStyle($prevItem, outClass);
                });

            $currentItem
                .addClass(inClass)
                .on(animEnd, function () {
                    base.endCurrent = true;
                    $currentItem.off(animEnd);
                    base.clearTransStyle($currentItem, inClass);
                });
        },

        clearTransStyle : function (item, classToRemove) {
            var base = this;
            item.css({
                "position" : "",
                "left" : ""
            }).removeClass(classToRemove);

            if (base.endPrev && base.endCurrent) {
                base.$owlWrapper.removeClass('owl-origin');
                base.endPrev = false;
                base.endCurrent = false;
                base.isTransition = false;
            }
        },

        owlStatus : function () {
            var base = this;
            base.owl = {
                "userOptions"   : base.userOptions,
                "baseElement"   : base.$elem,
                "userItems"     : base.$userItems,
                "owlItems"      : base.$owlItems,
                "currentItem"   : base.currentItem,
                "prevItem"      : base.prevItem,
                "visibleItems"  : base.visibleItems,
                "isTouch"       : base.browser.isTouch,
                "browser"       : base.browser,
                "dragDirection" : base.dragDirection
            };
        },

        clearEvents : function () {
            var base = this;
            base.$elem.off(".owl owl mousedown.disableTextSelect");
            $(document).off(".owl owl");
            $(window).off("resize", base.resizer);
        },

        unWrap : function () {
            var base = this;
            if (base.$elem.children().length !== 0) {
                base.$owlWrapper.unwrap();
                base.$userItems.unwrap().unwrap();
                if (base.owlControls) {
                    base.owlControls.remove();
                }
            }
            base.clearEvents();
            base.$elem
                .attr("style", base.$elem.data("owl-originalStyles") || "")
                .attr("class", base.$elem.data("owl-originalClasses"));
        },

        destroy : function () {
            var base = this;
            base.stop();
            window.clearInterval(base.checkVisible);
            base.unWrap();
            base.$elem.removeData();
        },

        reinit : function (newOptions) {
            var base = this,
                options = $.extend({}, base.userOptions, newOptions);
            base.unWrap();
            base.init(options, base.$elem);
        },

        addItem : function (htmlString, targetPosition) {
            var base = this,
                position;

            if (!htmlString) {return false; }

            if (base.$elem.children().length === 0) {
                base.$elem.append(htmlString);
                base.setVars();
                return false;
            }
            base.unWrap();
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }
            if (position >= base.$userItems.length || position === -1) {
                base.$userItems.eq(-1).after(htmlString);
            } else {
                base.$userItems.eq(position).before(htmlString);
            }

            base.setVars();
        },

        removeItem : function (targetPosition) {
            var base = this,
                position;

            if (base.$elem.children().length === 0) {
                return false;
            }
            if (targetPosition === undefined || targetPosition === -1) {
                position = -1;
            } else {
                position = targetPosition;
            }

            base.unWrap();
            base.$userItems.eq(position).remove();
            base.setVars();
        }

    };

    $.fn.owlCarousel = function (options) {
        return this.each(function () {
            if ($(this).data("owl-init") === true) {
                return false;
            }
            $(this).data("owl-init", true);
            var carousel = Object.create(Carousel);
            carousel.init(options, this);
            $.data(this, "owlCarousel", carousel);
        });
    };

    $.fn.owlCarousel.options = {

        items : 5,
        itemsCustom : false,
        itemsDesktop : [1199, 4],
        itemsDesktopSmall : [979, 3],
        itemsTablet : [768, 2],
        itemsTabletSmall : false,
        itemsMobile : [479, 1],
        singleItem : false,
        itemsScaleUp : false,

        slideSpeed : 200,
        paginationSpeed : 800,
        rewindSpeed : 1000,

        autoPlay : false,
        stopOnHover : false,

        navigation : false,
        navigationText : ["prev", "next"],
        rewindNav : true,
        scrollPerPage : false,

        pagination : true,
        paginationNumbers : false,

        responsive : true,
        responsiveRefreshRate : 200,
        responsiveBaseWidth : window,

        baseClass : "owl-carousel",
        theme : "owl-theme",

        lazyLoad : false,
        lazyFollow : true,
        lazyEffect : "fade",

        autoHeight : false,

        jsonPath : false,
        jsonSuccess : false,

        dragBeforeAnimFinish : true,
        mouseDrag : true,
        touchDrag : true,

        addClassActive : false,
        transitionStyle : false,

        beforeUpdate : false,
        afterUpdate : false,
        beforeInit : false,
        afterInit : false,
        beforeMove : false,
        afterMove : false,
        afterAction : false,
        startDragging : false,
        afterLazyLoad: false
    };
}(jQuery, window, document));
// SmoothScroll for websites v1.2.1
// Licensed under the terms of the MIT license.

// People involved
//  - Balazs Galambosi (maintainer)  
//  - Michael Herf     (Pulse Algorithm)

(function(){
  
// Scroll Variables (tweakable)
var defaultOptions = {

    // Scrolling Core
    frameRate        : 150, // [Hz]
    animationTime    : 400, // [px]
    stepSize         : 120, // [px]

    // Pulse (less tweakable)
    // ratio of "tail" to "acceleration"
    pulseAlgorithm   : true,
    pulseScale       : 8,
    pulseNormalize   : 1,

    // Acceleration
    accelerationDelta : 20,  // 20
    accelerationMax   : 1,   // 1

    // Keyboard Settings
    keyboardSupport   : true,  // option
    arrowScroll       : 50,     // [px]

    // Other
    touchpadSupport   : true,
    fixedBackground   : true, 
    excluded          : ""    
};

var options = defaultOptions;


// Other Variables
var isExcluded = false;
var isFrame = false;
var direction = { x: 0, y: 0 };
var initDone  = false;
var root = document.documentElement;
var activeElement;
var observer;
var deltaBuffer = [ 120, 120, 120 ];

var key = { left: 37, up: 38, right: 39, down: 40, spacebar: 32, 
            pageup: 33, pagedown: 34, end: 35, home: 36 };


/***********************************************
 * SETTINGS
 ***********************************************/

var options = defaultOptions;


/***********************************************
 * INITIALIZE
 ***********************************************/

/**
 * Tests if smooth scrolling is allowed. Shuts down everything if not.
 */
function initTest() {

    var disableKeyboard = false; 
    
    // disable keyboard support if anything above requested it
    if (disableKeyboard) {
        removeEvent("keydown", keydown);
    }

    if (options.keyboardSupport && !disableKeyboard) {
        addEvent("keydown", keydown);
    }
}

/**
 * Sets up scrolls array, determines if frames are involved.
 */
function init() {
  
    if (!document.body) return;

    var body = document.body;
    var html = document.documentElement;
    var windowHeight = window.innerHeight; 
    var scrollHeight = body.scrollHeight;
    
    // check compat mode for root element
    root = (document.compatMode.indexOf('CSS') >= 0) ? html : body;
    activeElement = body;
    
    initTest();
    initDone = true;

    // Checks if this script is running in a frame
    if (top != self) {
        isFrame = true;
    }

    /**
     * This fixes a bug where the areas left and right to 
     * the content does not trigger the onmousewheel event
     * on some pages. e.g.: html, body { height: 100% }
     */
    else if (scrollHeight > windowHeight &&
            (body.offsetHeight <= windowHeight || 
             html.offsetHeight <= windowHeight)) {

        html.style.height = 'auto';
        setTimeout(refresh, 10);

        // clearfix
        if (root.offsetHeight <= windowHeight) {
            var underlay = document.createElement("div"); 	
            underlay.style.clear = "both";
            body.appendChild(underlay);
        }
    }

    // disable fixed background
    if (!options.fixedBackground && !isExcluded) {
        body.style.backgroundAttachment = "scroll";
        html.style.backgroundAttachment = "scroll";
    }
}


/************************************************
 * SCROLLING 
 ************************************************/
 
var que = [];
var pending = false;
var lastScroll = +new Date;

/**
 * Pushes scroll actions to the scrolling queue.
 */
function scrollArray(elem, left, top, delay) {
    
    delay || (delay = 1000);
    directionCheck(left, top);

    if (options.accelerationMax != 1) {
        var now = +new Date;
        var elapsed = now - lastScroll;
        if (elapsed < options.accelerationDelta) {
            var factor = (1 + (30 / elapsed)) / 2;
            if (factor > 1) {
                factor = Math.min(factor, options.accelerationMax);
                left *= factor;
                top  *= factor;
            }
        }
        lastScroll = +new Date;
    }          
    
    // push a scroll command
    que.push({
        x: left, 
        y: top, 
        lastX: (left < 0) ? 0.99 : -0.99,
        lastY: (top  < 0) ? 0.99 : -0.99, 
        start: +new Date
    });
        
    // don't act if there's a pending queue
    if (pending) {
        return;
    }  

    var scrollWindow = (elem === document.body);
    
    var step = function (time) {
        
        var now = +new Date;
        var scrollX = 0;
        var scrollY = 0; 
    
        for (var i = 0; i < que.length; i++) {
            
            var item = que[i];
            var elapsed  = now - item.start;
            var finished = (elapsed >= options.animationTime);
            
            // scroll position: [0, 1]
            var position = (finished) ? 1 : elapsed / options.animationTime;
            
            // easing [optional]
            if (options.pulseAlgorithm) {
                position = pulse(position);
            }
            
            // only need the difference
            var x = (item.x * position - item.lastX) >> 0;
            var y = (item.y * position - item.lastY) >> 0;
            
            // add this to the total scrolling
            scrollX += x;
            scrollY += y;            
            
            // update last values
            item.lastX += x;
            item.lastY += y;
        
            // delete and step back if it's over
            if (finished) {
                que.splice(i, 1); i--;
            }           
        }

        // scroll left and top
        if (scrollWindow) {
            window.scrollBy(scrollX, scrollY);
        } 
        else {
            if (scrollX) elem.scrollLeft += scrollX;
            if (scrollY) elem.scrollTop  += scrollY;                    
        }
        
        // clean up if there's nothing left to do
        if (!left && !top) {
            que = [];
        }
        
        if (que.length) { 
            requestFrame(step, elem, (delay / options.frameRate + 1)); 
        } else { 
            pending = false;
        }
    };
    
    // start a new queue of actions
    requestFrame(step, elem, 0);
    pending = true;
}


/***********************************************
 * EVENTS
 ***********************************************/

/**
 * Mouse wheel handler.
 * @param {Object} event
 */
function wheel(event) {

    if (!initDone) {
        init();
    }
    
    var target = event.target;
    var overflowing = overflowingAncestor(target);
    
    // use default if there's no overflowing
    // element or default action is prevented    
    if (!overflowing || event.defaultPrevented ||
        isNodeName(activeElement, "embed") ||
       (isNodeName(target, "embed") && /\.pdf/i.test(target.src))) {
        return true;
    }

    var deltaX = event.wheelDeltaX || 0;
    var deltaY = event.wheelDeltaY || 0;
    
    // use wheelDelta if deltaX/Y is not available
    if (!deltaX && !deltaY) {
        deltaY = event.wheelDelta || 0;
    }

    // check if it's a touchpad scroll that should be ignored
    if (!options.touchpadSupport && isTouchpad(deltaY)) {
        return true;
    }

    // scale by step size
    // delta is 120 most of the time
    // synaptics seems to send 1 sometimes
    if (Math.abs(deltaX) > 1.2) {
        deltaX *= options.stepSize / 120;
    }
    if (Math.abs(deltaY) > 1.2) {
        deltaY *= options.stepSize / 120;
    }
    
    scrollArray(overflowing, -deltaX, -deltaY);
    event.preventDefault();
}

/**
 * Keydown event handler.
 * @param {Object} event
 */
function keydown(event) {

    var target   = event.target;
    var modifier = event.ctrlKey || event.altKey || event.metaKey || 
                  (event.shiftKey && event.keyCode !== key.spacebar);
    
    // do nothing if user is editing text
    // or using a modifier key (except shift)
    // or in a dropdown
    if ( /input|textarea|select|embed/i.test(target.nodeName) ||
         target.isContentEditable || 
         event.defaultPrevented   ||
         modifier ) {
      return true;
    }
    // spacebar should trigger button press
    if (isNodeName(target, "button") &&
        event.keyCode === key.spacebar) {
      return true;
    }
    
    var shift, x = 0, y = 0;
    var elem = overflowingAncestor(activeElement);
    var clientHeight = elem.clientHeight;

    if (elem == document.body) {
        clientHeight = window.innerHeight;
    }

    switch (event.keyCode) {
        case key.up:
            y = -options.arrowScroll;
            break;
        case key.down:
            y = options.arrowScroll;
            break;         
        case key.spacebar: // (+ shift)
            shift = event.shiftKey ? 1 : -1;
            y = -shift * clientHeight * 0.9;
            break;
        case key.pageup:
            y = -clientHeight * 0.9;
            break;
        case key.pagedown:
            y = clientHeight * 0.9;
            break;
        case key.home:
            y = -elem.scrollTop;
            break;
        case key.end:
            var damt = elem.scrollHeight - elem.scrollTop - clientHeight;
            y = (damt > 0) ? damt+10 : 0;
            break;
        case key.left:
            x = -options.arrowScroll;
            break;
        case key.right:
            x = options.arrowScroll;
            break;            
        default:
            return true; // a key we don't care about
    }

    scrollArray(elem, x, y);
    event.preventDefault();
}

/**
 * Mousedown event only for updating activeElement
 */
function mousedown(event) {
    activeElement = event.target;
}


/***********************************************
 * OVERFLOW
 ***********************************************/
 
var cache = {}; // cleared out every once in while
setInterval(function () { cache = {}; }, 10 * 1000);

var uniqueID = (function () {
    var i = 0;
    return function (el) {
        return el.uniqueID || (el.uniqueID = i++);
    };
})();

function setCache(elems, overflowing) {
    for (var i = elems.length; i--;)
        cache[uniqueID(elems[i])] = overflowing;
    return overflowing;
}

function overflowingAncestor(el) {
    var elems = [];
    var rootScrollHeight = root.scrollHeight;
    do {
        var cached = cache[uniqueID(el)];
        if (cached) {
            return setCache(elems, cached);
        }
        elems.push(el);
        if (rootScrollHeight === el.scrollHeight) {
            if (!isFrame || root.clientHeight + 10 < rootScrollHeight) {
                return setCache(elems, document.body); // scrolling root in WebKit
            }
        } else if (el.clientHeight + 10 < el.scrollHeight) {
            overflow = getComputedStyle(el, "").getPropertyValue("overflow-y");
            if (overflow === "scroll" || overflow === "auto") {
                return setCache(elems, el);
            }
        }
    } while (el = el.parentNode);
}


/***********************************************
 * HELPERS
 ***********************************************/

function addEvent(type, fn, bubble) {
    window.addEventListener(type, fn, (bubble||false));
}

function removeEvent(type, fn, bubble) {
    window.removeEventListener(type, fn, (bubble||false));  
}

function isNodeName(el, tag) {
    return (el.nodeName||"").toLowerCase() === tag.toLowerCase();
}

function directionCheck(x, y) {
    x = (x > 0) ? 1 : -1;
    y = (y > 0) ? 1 : -1;
    if (direction.x !== x || direction.y !== y) {
        direction.x = x;
        direction.y = y;
        que = [];
        lastScroll = 0;
    }
}

var deltaBufferTimer;

function isTouchpad(deltaY) {
    if (!deltaY) return;
    deltaY = Math.abs(deltaY)
    deltaBuffer.push(deltaY);
    deltaBuffer.shift();
    clearTimeout(deltaBufferTimer);

    var allEquals    = (deltaBuffer[0] == deltaBuffer[1] && 
                        deltaBuffer[1] == deltaBuffer[2]);
    var allDivisable = (isDivisible(deltaBuffer[0], 120) &&
                        isDivisible(deltaBuffer[1], 120) &&
                        isDivisible(deltaBuffer[2], 120));
    return !(allEquals || allDivisable);
} 

function isDivisible(n, divisor) {
    return (Math.floor(n / divisor) == n / divisor);
}

var requestFrame = (function () {
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              function (callback, element, delay) {
                  window.setTimeout(callback, delay || (1000/60));
              };
})();


/***********************************************
 * PULSE
 ***********************************************/
 
/**
 * Viscous fluid with a pulse for part and decay for the rest.
 * - Applies a fixed force over an interval (a damped acceleration), and
 * - Lets the exponential bleed away the velocity over a longer interval
 * - Michael Herf, http://stereopsis.com/stopping/
 */
function pulse_(x) {
    var val, start, expx;
    // test
    x = x * options.pulseScale;
    if (x < 1) { // acceleartion
        val = x - (1 - Math.exp(-x));
    } else {     // tail
        // the previous animation ended here:
        start = Math.exp(-1);
        // simple viscous drag
        x -= 1;
        expx = 1 - Math.exp(-x);
        val = start + (expx * (1 - start));
    }
    return val * options.pulseNormalize;
}

function pulse(x) {
    if (x >= 1) return 1;
    if (x <= 0) return 0;

    if (options.pulseNormalize == 1) {
        options.pulseNormalize /= pulse_(1);
    }
    return pulse_(x);
}

var isChrome = /chrome/i.test(window.navigator.userAgent);
var isMouseWheelSupported = 'onmousewheel' in document; 

if (isMouseWheelSupported && isChrome) {
	addEvent("mousedown", mousedown);
	addEvent("mousewheel", wheel);
	addEvent("load", init);
};

})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbnRhY3RfbWUuanMiLCJqcUJvb3RzdHJhcFZhbGlkYXRpb24uanMiLCJqcXVlcnkuaXNvdG9wZS5qcyIsImpxdWVyeS5wcmV0dHlQaG90by5qcyIsIm1haW4uanMiLCJvd2wuY2Fyb3VzZWwuanMiLCJTbW9vdGhTY3JvbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2g1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOTNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDditDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhc3NldHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiQoZnVuY3Rpb24oKSB7XG5cbiAgICAkKFwiaW5wdXQsdGV4dGFyZWFcIikuanFCb290c3RyYXBWYWxpZGF0aW9uKHtcbiAgICAgICAgcHJldmVudFN1Ym1pdDogdHJ1ZSxcbiAgICAgICAgc3VibWl0RXJyb3I6IGZ1bmN0aW9uKCRmb3JtLCBldmVudCwgZXJyb3JzKSB7XG4gICAgICAgICAgICAvLyBhZGRpdGlvbmFsIGVycm9yIG1lc3NhZ2VzIG9yIGV2ZW50c1xuICAgICAgICB9LFxuICAgICAgICBzdWJtaXRTdWNjZXNzOiBmdW5jdGlvbigkZm9ybSwgZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIHByZXZlbnQgZGVmYXVsdCBzdWJtaXQgYmVoYXZpb3VyXG4gICAgICAgICAgICAvLyBnZXQgdmFsdWVzIGZyb20gRk9STVxuICAgICAgICAgICAgdmFyIG5hbWUgPSAkKFwiaW5wdXQjbmFtZVwiKS52YWwoKTtcbiAgICAgICAgICAgIHZhciBlbWFpbCA9ICQoXCJpbnB1dCNlbWFpbFwiKS52YWwoKTtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gJChcInRleHRhcmVhI21lc3NhZ2VcIikudmFsKCk7XG4gICAgICAgICAgICB2YXIgZmlyc3ROYW1lID0gbmFtZTsgLy8gRm9yIFN1Y2Nlc3MvRmFpbHVyZSBNZXNzYWdlXG4gICAgICAgICAgICAvLyBDaGVjayBmb3Igd2hpdGUgc3BhY2UgaW4gbmFtZSBmb3IgU3VjY2Vzcy9GYWlsIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmIChmaXJzdE5hbWUuaW5kZXhPZignICcpID49IDApIHtcbiAgICAgICAgICAgICAgICBmaXJzdE5hbWUgPSBuYW1lLnNwbGl0KCcgJykuc2xpY2UoMCwgLTEpLmpvaW4oJyAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdXJsOiBcImFzc2V0cy9waHAvbWFpbC9jb250YWN0X21lLnBocFwiLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWNoZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFN1Y2Nlc3MgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAkKCcjc3VjY2VzcycpLmh0bWwoXCI8ZGl2IGNsYXNzPSdhbGVydCBhbGVydC1zdWNjZXNzJz5cIik7XG4gICAgICAgICAgICAgICAgICAgICQoJyNzdWNjZXNzID4gLmFsZXJ0LXN1Y2Nlc3MnKS5odG1sKFwiPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzPSdjbG9zZScgZGF0YS1kaXNtaXNzPSdhbGVydCcgYXJpYS1oaWRkZW49J3RydWUnPiZ0aW1lcztcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoXCI8L2J1dHRvbj5cIik7XG4gICAgICAgICAgICAgICAgICAgICQoJyNzdWNjZXNzID4gLmFsZXJ0LXN1Y2Nlc3MnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFwcGVuZChcIjxzdHJvbmc+0JLQsNGI0LUg0YHQvtC+0LHRidC10L3QuNC1INC+0YLQv9GA0LDQstC70LXQvdC+PC9zdHJvbmc+XCIpO1xuICAgICAgICAgICAgICAgICAgICAkKCcjc3VjY2VzcyA+IC5hbGVydC1zdWNjZXNzJylcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJzwvZGl2PicpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vY2xlYXIgYWxsIGZpZWxkc1xuICAgICAgICAgICAgICAgICAgICAkKCcjY29udGFjdEZvcm0nKS50cmlnZ2VyKFwicmVzZXRcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZhaWwgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAkKCcjc3VjY2VzcycpLmh0bWwoXCI8ZGl2IGNsYXNzPSdhbGVydCBhbGVydC1kYW5nZXInPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI3N1Y2Nlc3MgPiAuYWxlcnQtZGFuZ2VyJykuaHRtbChcIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0nY2xvc2UnIGRhdGEtZGlzbWlzcz0nYWxlcnQnIGFyaWEtaGlkZGVuPSd0cnVlJz4mdGltZXM7XCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kKFwiPC9idXR0b24+XCIpO1xuICAgICAgICAgICAgICAgICAgICAkKCcjc3VjY2VzcyA+IC5hbGVydC1kYW5nZXInKS5hcHBlbmQoXCI8c3Ryb25nPlNvcnJ5IFwiICsgZmlyc3ROYW1lICsgXCIsINC60LDQttC10YLRgdGPLCDRgdC10YDQstC10YAg0L3QtSDQvtGC0LLQtdGH0LDQtdGCLiDQn9C+0L/RgNC+0LHRg9C50YLQtSDQtdGJ0LUg0YDQsNC3IVwiKTtcbiAgICAgICAgICAgICAgICAgICAgJCgnI3N1Y2Nlc3MgPiAuYWxlcnQtZGFuZ2VyJykuYXBwZW5kKCc8L2Rpdj4nKTtcbiAgICAgICAgICAgICAgICAgICAgLy9jbGVhciBhbGwgZmllbGRzXG4gICAgICAgICAgICAgICAgICAgICQoJyNjb250YWN0Rm9ybScpLnRyaWdnZXIoXCJyZXNldFwiKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkKHRoaXMpLmlzKFwiOnZpc2libGVcIik7XG4gICAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAkKFwiYVtkYXRhLXRvZ2dsZT1cXFwidGFiXFxcIl1cIikuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICQodGhpcykudGFiKFwic2hvd1wiKTtcbiAgICB9KTtcbn0pO1xuXG5cbiQoJyNuYW1lJykuZm9jdXMoZnVuY3Rpb24oKSB7XG4gICAgJCgnI3N1Y2Nlc3MnKS5odG1sKCcnKTtcbn0pO1xuKi8iLCIvKiBqcUJvb3RzdHJhcFZhbGlkYXRpb25cbiAqIEEgcGx1Z2luIGZvciBhdXRvbWF0aW5nIHZhbGlkYXRpb24gb24gVHdpdHRlciBCb290c3RyYXAgZm9ybWF0dGVkIGZvcm1zLlxuICpcbiAqIHYxLjMuNlxuICpcbiAqIExpY2Vuc2U6IE1JVCA8aHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocD4gLSBzZWUgTElDRU5TRSBmaWxlXG4gKlxuICogaHR0cDovL1JlYWN0aXZlUmF2ZW4uZ2l0aHViLmNvbS9qcUJvb3RzdHJhcFZhbGlkYXRpb24vXG4gKi9cblxuKGZ1bmN0aW9uKCAkICl7XG5cblx0dmFyIGNyZWF0ZWRFbGVtZW50cyA9IFtdO1xuXG5cdHZhciBkZWZhdWx0cyA9IHtcblx0XHRvcHRpb25zOiB7XG5cdFx0XHRwcmVwZW5kRXhpc3RpbmdIZWxwQmxvY2s6IGZhbHNlLFxuXHRcdFx0c25pZmZIdG1sOiB0cnVlLCAvLyBzbmlmZiBmb3IgJ3JlcXVpcmVkJywgJ21heGxlbmd0aCcsIGV0Y1xuXHRcdFx0cHJldmVudFN1Ym1pdDogdHJ1ZSwgLy8gc3RvcCB0aGUgZm9ybSBzdWJtaXQgZXZlbnQgZnJvbSBmaXJpbmcgaWYgdmFsaWRhdGlvbiBmYWlsc1xuXHRcdFx0c3VibWl0RXJyb3I6IGZhbHNlLCAvLyBmdW5jdGlvbiBjYWxsZWQgaWYgdGhlcmUgaXMgYW4gZXJyb3Igd2hlbiB0cnlpbmcgdG8gc3VibWl0XG5cdFx0XHRzdWJtaXRTdWNjZXNzOiBmYWxzZSwgLy8gZnVuY3Rpb24gY2FsbGVkIGp1c3QgYmVmb3JlIGEgc3VjY2Vzc2Z1bCBzdWJtaXQgZXZlbnQgaXMgc2VudCB0byB0aGUgc2VydmVyXG4gICAgICAgICAgICBzZW1hbnRpY2FsbHlTdHJpY3Q6IGZhbHNlLCAvLyBzZXQgdG8gdHJ1ZSB0byB0aWR5IHVwIGdlbmVyYXRlZCBIVE1MIG91dHB1dFxuXHRcdFx0YXV0b0FkZDoge1xuXHRcdFx0XHRoZWxwQmxvY2tzOiB0cnVlXG5cdFx0XHR9LFxuICAgICAgICAgICAgZmlsdGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuICQodGhpcykuaXMoXCI6dmlzaWJsZVwiKTsgLy8gb25seSB2YWxpZGF0ZSBlbGVtZW50cyB5b3UgY2FuIHNlZVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyB2YWxpZGF0ZSBldmVyeXRoaW5nXG4gICAgICAgICAgICB9XG5cdFx0fSxcbiAgICBtZXRob2RzOiB7XG4gICAgICBpbml0IDogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cbiAgICAgICAgdmFyIHNldHRpbmdzID0gJC5leHRlbmQodHJ1ZSwge30sIGRlZmF1bHRzKTtcblxuICAgICAgICBzZXR0aW5ncy5vcHRpb25zID0gJC5leHRlbmQodHJ1ZSwgc2V0dGluZ3Mub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAgICAgdmFyICRzaWJsaW5nRWxlbWVudHMgPSB0aGlzO1xuXG4gICAgICAgIHZhciB1bmlxdWVGb3JtcyA9ICQudW5pcXVlKFxuICAgICAgICAgICRzaWJsaW5nRWxlbWVudHMubWFwKCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJCh0aGlzKS5wYXJlbnRzKFwiZm9ybVwiKVswXTtcbiAgICAgICAgICB9KS50b0FycmF5KClcbiAgICAgICAgKTtcblxuICAgICAgICAkKHVuaXF1ZUZvcm1zKS5iaW5kKFwic3VibWl0XCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgdmFyICRmb3JtID0gJCh0aGlzKTtcbiAgICAgICAgICB2YXIgd2FybmluZ3NGb3VuZCA9IDA7XG4gICAgICAgICAgdmFyICRpbnB1dHMgPSAkZm9ybS5maW5kKFwiaW5wdXQsdGV4dGFyZWEsc2VsZWN0XCIpLm5vdChcIlt0eXBlPXN1Ym1pdF0sW3R5cGU9aW1hZ2VdXCIpLmZpbHRlcihzZXR0aW5ncy5vcHRpb25zLmZpbHRlcik7XG4gICAgICAgICAgJGlucHV0cy50cmlnZ2VyKFwic3VibWl0LnZhbGlkYXRpb25cIikudHJpZ2dlcihcInZhbGlkYXRpb25Mb3N0Rm9jdXMudmFsaWRhdGlvblwiKTtcblxuICAgICAgICAgICRpbnB1dHMuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQoZWwpLFxuICAgICAgICAgICAgICAkY29udHJvbEdyb3VwID0gJHRoaXMucGFyZW50cyhcIi5mb3JtLWdyb3VwXCIpLmZpcnN0KCk7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICRjb250cm9sR3JvdXAuaGFzQ2xhc3MoXCJ3YXJuaW5nXCIpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgJGNvbnRyb2xHcm91cC5yZW1vdmVDbGFzcyhcIndhcm5pbmdcIikuYWRkQ2xhc3MoXCJlcnJvclwiKTtcbiAgICAgICAgICAgICAgd2FybmluZ3NGb3VuZCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgJGlucHV0cy50cmlnZ2VyKFwidmFsaWRhdGlvbkxvc3RGb2N1cy52YWxpZGF0aW9uXCIpO1xuXG4gICAgICAgICAgaWYgKHdhcm5pbmdzRm91bmQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5vcHRpb25zLnByZXZlbnRTdWJtaXQpIHtcbiAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJGZvcm0uYWRkQ2xhc3MoXCJlcnJvclwiKTtcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2V0dGluZ3Mub3B0aW9ucy5zdWJtaXRFcnJvcikpIHtcbiAgICAgICAgICAgICAgc2V0dGluZ3Mub3B0aW9ucy5zdWJtaXRFcnJvcigkZm9ybSwgZSwgJGlucHV0cy5qcUJvb3RzdHJhcFZhbGlkYXRpb24oXCJjb2xsZWN0RXJyb3JzXCIsIHRydWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGZvcm0ucmVtb3ZlQ2xhc3MoXCJlcnJvclwiKTtcbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oc2V0dGluZ3Mub3B0aW9ucy5zdWJtaXRTdWNjZXNzKSkge1xuICAgICAgICAgICAgICBzZXR0aW5ncy5vcHRpb25zLnN1Ym1pdFN1Y2Nlc3MoJGZvcm0sIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgLy8gR2V0IHJlZmVyZW5jZXMgdG8gZXZlcnl0aGluZyB3ZSdyZSBpbnRlcmVzdGVkIGluXG4gICAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgICRjb250cm9sR3JvdXAgPSAkdGhpcy5wYXJlbnRzKFwiLmZvcm0tZ3JvdXBcIikuZmlyc3QoKSxcbiAgICAgICAgICAgICRoZWxwQmxvY2sgPSAkY29udHJvbEdyb3VwLmZpbmQoXCIuaGVscC1ibG9ja1wiKS5maXJzdCgpLFxuICAgICAgICAgICAgJGZvcm0gPSAkdGhpcy5wYXJlbnRzKFwiZm9ybVwiKS5maXJzdCgpLFxuICAgICAgICAgICAgdmFsaWRhdG9yTmFtZXMgPSBbXTtcblxuICAgICAgICAgIC8vIGNyZWF0ZSBtZXNzYWdlIGNvbnRhaW5lciBpZiBub3QgZXhpc3RzXG4gICAgICAgICAgaWYgKCEkaGVscEJsb2NrLmxlbmd0aCAmJiBzZXR0aW5ncy5vcHRpb25zLmF1dG9BZGQgJiYgc2V0dGluZ3Mub3B0aW9ucy5hdXRvQWRkLmhlbHBCbG9ja3MpIHtcbiAgICAgICAgICAgICAgJGhlbHBCbG9jayA9ICQoJzxkaXYgY2xhc3M9XCJoZWxwLWJsb2NrXCIgLz4nKTtcbiAgICAgICAgICAgICAgJGNvbnRyb2xHcm91cC5maW5kKCcuY29udHJvbHMnKS5hcHBlbmQoJGhlbHBCbG9jayk7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZWRFbGVtZW50cy5wdXNoKCRoZWxwQmxvY2tbMF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTTklGRiBIVE1MIEZPUiBWQUxJREFUT1JTXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICAgICAgLy8gKnNub3J0IHNuaWZmIHNudWZmbGUqXG5cbiAgICAgICAgICBpZiAoc2V0dGluZ3Mub3B0aW9ucy5zbmlmZkh0bWwpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJcIjtcbiAgICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQQVRURVJOXG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIGlmICgkdGhpcy5hdHRyKFwicGF0dGVyblwiKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIk5vdCBpbiB0aGUgZXhwZWN0ZWQgZm9ybWF0PCEtLSBkYXRhLXZhbGlkYXRpb24tcGF0dGVybi1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiO1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuZGF0YShcInZhbGlkYXRpb25QYXR0ZXJuTWVzc2FnZVwiKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAkdGhpcy5kYXRhKFwidmFsaWRhdGlvblBhdHRlcm5NZXNzYWdlXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uUGF0dGVybk1lc3NhZ2VcIiwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uUGF0dGVyblJlZ2V4XCIsICR0aGlzLmF0dHIoXCJwYXR0ZXJuXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUFYXG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIGlmICgkdGhpcy5hdHRyKFwibWF4XCIpICE9PSB1bmRlZmluZWQgfHwgJHRoaXMuYXR0cihcImFyaWEtdmFsdWVtYXhcIikgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICB2YXIgbWF4ID0gKCR0aGlzLmF0dHIoXCJtYXhcIikgIT09IHVuZGVmaW5lZCA/ICR0aGlzLmF0dHIoXCJtYXhcIikgOiAkdGhpcy5hdHRyKFwiYXJpYS12YWx1ZW1heFwiKSk7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlRvbyBoaWdoOiBNYXhpbXVtIG9mICdcIiArIG1heCArIFwiJzwhLS0gZGF0YS12YWxpZGF0aW9uLW1heC1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiO1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuZGF0YShcInZhbGlkYXRpb25NYXhNZXNzYWdlXCIpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWF4TWVzc2FnZVwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk1heE1lc3NhZ2VcIiwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWF4TWF4XCIsIG1heCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1JTlxuICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBpZiAoJHRoaXMuYXR0cihcIm1pblwiKSAhPT0gdW5kZWZpbmVkIHx8ICR0aGlzLmF0dHIoXCJhcmlhLXZhbHVlbWluXCIpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgdmFyIG1pbiA9ICgkdGhpcy5hdHRyKFwibWluXCIpICE9PSB1bmRlZmluZWQgPyAkdGhpcy5hdHRyKFwibWluXCIpIDogJHRoaXMuYXR0cihcImFyaWEtdmFsdWVtaW5cIikpO1xuICAgICAgICAgICAgICBtZXNzYWdlID0gXCJUb28gbG93OiBNaW5pbXVtIG9mICdcIiArIG1pbiArIFwiJzwhLS0gZGF0YS12YWxpZGF0aW9uLW1pbi1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiO1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuZGF0YShcInZhbGlkYXRpb25NaW5NZXNzYWdlXCIpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWluTWVzc2FnZVwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk1pbk1lc3NhZ2VcIiwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWluTWluXCIsIG1pbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE1BWExFTkdUSFxuICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBpZiAoJHRoaXMuYXR0cihcIm1heGxlbmd0aFwiKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlRvbyBsb25nOiBNYXhpbXVtIG9mICdcIiArICR0aGlzLmF0dHIoXCJtYXhsZW5ndGhcIikgKyBcIicgY2hhcmFjdGVyczwhLS0gZGF0YS12YWxpZGF0aW9uLW1heGxlbmd0aC1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiO1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuZGF0YShcInZhbGlkYXRpb25NYXhsZW5ndGhNZXNzYWdlXCIpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWF4bGVuZ3RoTWVzc2FnZVwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk1heGxlbmd0aE1lc3NhZ2VcIiwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWF4bGVuZ3RoTWF4bGVuZ3RoXCIsICR0aGlzLmF0dHIoXCJtYXhsZW5ndGhcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNSU5MRU5HVEhcbiAgICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgaWYgKCR0aGlzLmF0dHIoXCJtaW5sZW5ndGhcIikgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gXCJUb28gc2hvcnQ6IE1pbmltdW0gb2YgJ1wiICsgJHRoaXMuYXR0cihcIm1pbmxlbmd0aFwiKSArIFwiJyBjaGFyYWN0ZXJzPCEtLSBkYXRhLXZhbGlkYXRpb24tbWlubGVuZ3RoLW1lc3NhZ2UgdG8gb3ZlcnJpZGUgLS0+XCI7XG4gICAgICAgICAgICAgIGlmICgkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk1pbmxlbmd0aE1lc3NhZ2VcIikpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gJHRoaXMuZGF0YShcInZhbGlkYXRpb25NaW5sZW5ndGhNZXNzYWdlXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWlubGVuZ3RoTWVzc2FnZVwiLCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgJHRoaXMuZGF0YShcInZhbGlkYXRpb25NaW5sZW5ndGhNaW5sZW5ndGhcIiwgJHRoaXMuYXR0cihcIm1pbmxlbmd0aFwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBSRVFVSVJFRFxuICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBpZiAoJHRoaXMuYXR0cihcInJlcXVpcmVkXCIpICE9PSB1bmRlZmluZWQgfHwgJHRoaXMuYXR0cihcImFyaWEtcmVxdWlyZWRcIikgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gc2V0dGluZ3MuYnVpbHRJblZhbGlkYXRvcnMucmVxdWlyZWQubWVzc2FnZTtcbiAgICAgICAgICAgICAgaWYgKCR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uUmVxdWlyZWRNZXNzYWdlXCIpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uUmVxdWlyZWRNZXNzYWdlXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uUmVxdWlyZWRNZXNzYWdlXCIsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBOVU1CRVJcbiAgICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgaWYgKCR0aGlzLmF0dHIoXCJ0eXBlXCIpICE9PSB1bmRlZmluZWQgJiYgJHRoaXMuYXR0cihcInR5cGVcIikudG9Mb3dlckNhc2UoKSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gc2V0dGluZ3MuYnVpbHRJblZhbGlkYXRvcnMubnVtYmVyLm1lc3NhZ2U7XG4gICAgICAgICAgICAgIGlmICgkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk51bWJlck1lc3NhZ2VcIikpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gJHRoaXMuZGF0YShcInZhbGlkYXRpb25OdW1iZXJNZXNzYWdlXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTnVtYmVyTWVzc2FnZVwiLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVNQUlMXG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIGlmICgkdGhpcy5hdHRyKFwidHlwZVwiKSAhPT0gdW5kZWZpbmVkICYmICR0aGlzLmF0dHIoXCJ0eXBlXCIpLnRvTG93ZXJDYXNlKCkgPT09IFwiZW1haWxcIikge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gXCLQndC10L/RgNCw0LLQuNC70YzQvdGL0LkgZW1haWwg0LDQtNGA0LXRgTwhLS0gZGF0YS12YWxpZGF0b3ItdmFsaWRlbWFpbC1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiO1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuZGF0YShcInZhbGlkYXRpb25WYWxpZGVtYWlsTWVzc2FnZVwiKSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSAkdGhpcy5kYXRhKFwidmFsaWRhdGlvblZhbGlkZW1haWxNZXNzYWdlXCIpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uRW1haWxNZXNzYWdlXCIpKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uRW1haWxNZXNzYWdlXCIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uVmFsaWRlbWFpbE1lc3NhZ2VcIiwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgTUlOQ0hFQ0tFRFxuICAgICAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBpZiAoJHRoaXMuYXR0cihcIm1pbmNoZWNrZWRcIikgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBtZXNzYWdlID0gXCJOb3QgZW5vdWdoIG9wdGlvbnMgY2hlY2tlZDsgTWluaW11bSBvZiAnXCIgKyAkdGhpcy5hdHRyKFwibWluY2hlY2tlZFwiKSArIFwiJyByZXF1aXJlZDwhLS0gZGF0YS12YWxpZGF0aW9uLW1pbmNoZWNrZWQtbWVzc2FnZSB0byBvdmVycmlkZSAtLT5cIjtcbiAgICAgICAgICAgICAgaWYgKCR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWluY2hlY2tlZE1lc3NhZ2VcIikpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gJHRoaXMuZGF0YShcInZhbGlkYXRpb25NaW5jaGVja2VkTWVzc2FnZVwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk1pbmNoZWNrZWRNZXNzYWdlXCIsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk1pbmNoZWNrZWRNaW5jaGVja2VkXCIsICR0aGlzLmF0dHIoXCJtaW5jaGVja2VkXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNQVhDSEVDS0VEXG4gICAgICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIGlmICgkdGhpcy5hdHRyKFwibWF4Y2hlY2tlZFwiKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBcIlRvbyBtYW55IG9wdGlvbnMgY2hlY2tlZDsgTWF4aW11bSBvZiAnXCIgKyAkdGhpcy5hdHRyKFwibWF4Y2hlY2tlZFwiKSArIFwiJyByZXF1aXJlZDwhLS0gZGF0YS12YWxpZGF0aW9uLW1heGNoZWNrZWQtbWVzc2FnZSB0byBvdmVycmlkZSAtLT5cIjtcbiAgICAgICAgICAgICAgaWYgKCR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uTWF4Y2hlY2tlZE1lc3NhZ2VcIikpIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gJHRoaXMuZGF0YShcInZhbGlkYXRpb25NYXhjaGVja2VkTWVzc2FnZVwiKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk1heGNoZWNrZWRNZXNzYWdlXCIsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAkdGhpcy5kYXRhKFwidmFsaWRhdGlvbk1heGNoZWNrZWRNYXhjaGVja2VkXCIsICR0aGlzLmF0dHIoXCJtYXhjaGVja2VkXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDT0xMRUNUIFZBTElEQVRPUiBOQU1FU1xuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICAgICAgIC8vIEdldCBuYW1lZCB2YWxpZGF0b3JzXG4gICAgICAgICAgaWYgKCR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhbGlkYXRvck5hbWVzID0gJHRoaXMuZGF0YShcInZhbGlkYXRpb25cIikuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEdldCBleHRyYSBvbmVzIGRlZmluZWQgb24gdGhlIGVsZW1lbnQncyBkYXRhIGF0dHJpYnV0ZXNcbiAgICAgICAgICAkLmVhY2goJHRoaXMuZGF0YSgpLCBmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgIHZhciBwYXJ0cyA9IGkucmVwbGFjZSgvKFtBLVpdKS9nLCBcIiwkMVwiKS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICBpZiAocGFydHNbMF0gPT09IFwidmFsaWRhdGlvblwiICYmIHBhcnRzWzFdKSB7XG4gICAgICAgICAgICAgIHZhbGlkYXRvck5hbWVzLnB1c2gocGFydHNbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE5PUk1BTElTRSBWQUxJREFUT1IgTkFNRVNcbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAgICAgICB2YXIgdmFsaWRhdG9yTmFtZXNUb0luc3BlY3QgPSB2YWxpZGF0b3JOYW1lcztcbiAgICAgICAgICB2YXIgbmV3VmFsaWRhdG9yTmFtZXNUb0luc3BlY3QgPSBbXTtcblxuICAgICAgICAgIGRvIC8vIHJlcGVhdGVkbHkgZXhwYW5kICdzaG9ydGN1dCcgdmFsaWRhdG9ycyBpbnRvIHRoZWlyIHJlYWwgdmFsaWRhdG9yc1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIC8vIFVwcGVyY2FzZSBvbmx5IHRoZSBmaXJzdCBsZXR0ZXIgb2YgZWFjaCBuYW1lXG4gICAgICAgICAgICAkLmVhY2godmFsaWRhdG9yTmFtZXMsIGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgICB2YWxpZGF0b3JOYW1lc1tpXSA9IGZvcm1hdFZhbGlkYXRvck5hbWUoZWwpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFJlbW92ZSBkdXBsaWNhdGUgdmFsaWRhdG9yIG5hbWVzXG4gICAgICAgICAgICB2YWxpZGF0b3JOYW1lcyA9ICQudW5pcXVlKHZhbGlkYXRvck5hbWVzKTtcblxuICAgICAgICAgICAgLy8gUHVsbCBvdXQgdGhlIG5ldyB2YWxpZGF0b3IgbmFtZXMgZnJvbSBlYWNoIHNob3J0Y3V0XG4gICAgICAgICAgICBuZXdWYWxpZGF0b3JOYW1lc1RvSW5zcGVjdCA9IFtdO1xuICAgICAgICAgICAgJC5lYWNoKHZhbGlkYXRvck5hbWVzVG9JbnNwZWN0LCBmdW5jdGlvbihpLCBlbCkge1xuICAgICAgICAgICAgICBpZiAoJHRoaXMuZGF0YShcInZhbGlkYXRpb25cIiArIGVsICsgXCJTaG9ydGN1dFwiKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQXJlIHRoZXNlIGN1c3RvbSB2YWxpZGF0b3JzP1xuICAgICAgICAgICAgICAgIC8vIFB1bGwgdGhlbSBvdXQhXG4gICAgICAgICAgICAgICAgJC5lYWNoKCR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIgKyBlbCArIFwiU2hvcnRjdXRcIikuc3BsaXQoXCIsXCIpLCBmdW5jdGlvbihpMiwgZWwyKSB7XG4gICAgICAgICAgICAgICAgICBuZXdWYWxpZGF0b3JOYW1lc1RvSW5zcGVjdC5wdXNoKGVsMik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2V0dGluZ3MuYnVpbHRJblZhbGlkYXRvcnNbZWwudG9Mb3dlckNhc2UoKV0pIHtcbiAgICAgICAgICAgICAgICAvLyBJcyB0aGlzIGEgcmVjb2duaXNlZCBidWlsdC1pbj9cbiAgICAgICAgICAgICAgICAvLyBQdWxsIGl0IG91dCFcbiAgICAgICAgICAgICAgICB2YXIgdmFsaWRhdG9yID0gc2V0dGluZ3MuYnVpbHRJblZhbGlkYXRvcnNbZWwudG9Mb3dlckNhc2UoKV07XG4gICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRvci50eXBlLnRvTG93ZXJDYXNlKCkgPT09IFwic2hvcnRjdXRcIikge1xuICAgICAgICAgICAgICAgICAgJC5lYWNoKHZhbGlkYXRvci5zaG9ydGN1dC5zcGxpdChcIixcIiksIGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgICAgICAgICAgICBlbCA9IGZvcm1hdFZhbGlkYXRvck5hbWUoZWwpO1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWxpZGF0b3JOYW1lc1RvSW5zcGVjdC5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yTmFtZXMucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YWxpZGF0b3JOYW1lc1RvSW5zcGVjdCA9IG5ld1ZhbGlkYXRvck5hbWVzVG9JbnNwZWN0O1xuXG4gICAgICAgICAgfSB3aGlsZSAodmFsaWRhdG9yTmFtZXNUb0luc3BlY3QubGVuZ3RoID4gMClcblxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNFVCBVUCBWQUxJREFUT1IgQVJSQVlTXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgICAgICAgdmFyIHZhbGlkYXRvcnMgPSB7fTtcblxuICAgICAgICAgICQuZWFjaCh2YWxpZGF0b3JOYW1lcywgZnVuY3Rpb24gKGksIGVsKSB7XG4gICAgICAgICAgICAvLyBTZXQgdXAgdGhlICdvdmVycmlkZScgbWVzc2FnZVxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAkdGhpcy5kYXRhKFwidmFsaWRhdGlvblwiICsgZWwgKyBcIk1lc3NhZ2VcIik7XG4gICAgICAgICAgICB2YXIgaGFzT3ZlcnJpZGVNZXNzYWdlID0gKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB2YXIgZm91bmRWYWxpZGF0b3IgPSBmYWxzZTtcbiAgICAgICAgICAgIG1lc3NhZ2UgPVxuICAgICAgICAgICAgICAoXG4gICAgICAgICAgICAgICAgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgPyBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICA6IFwiJ1wiICsgZWwgKyBcIicgdmFsaWRhdGlvbiBmYWlsZWQgPCEtLSBBZGQgYXR0cmlidXRlICdkYXRhLXZhbGlkYXRpb24tXCIgKyBlbC50b0xvd2VyQ2FzZSgpICsgXCItbWVzc2FnZScgdG8gaW5wdXQgdG8gY2hhbmdlIHRoaXMgbWVzc2FnZSAtLT5cIlxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICA7XG5cbiAgICAgICAgICAgICQuZWFjaChcbiAgICAgICAgICAgICAgc2V0dGluZ3MudmFsaWRhdG9yVHlwZXMsXG4gICAgICAgICAgICAgIGZ1bmN0aW9uICh2YWxpZGF0b3JUeXBlLCB2YWxpZGF0b3JUZW1wbGF0ZSkge1xuICAgICAgICAgICAgICAgIGlmICh2YWxpZGF0b3JzW3ZhbGlkYXRvclR5cGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgIHZhbGlkYXRvcnNbdmFsaWRhdG9yVHlwZV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFmb3VuZFZhbGlkYXRvciAmJiAkdGhpcy5kYXRhKFwidmFsaWRhdGlvblwiICsgZWwgKyBmb3JtYXRWYWxpZGF0b3JOYW1lKHZhbGlkYXRvclRlbXBsYXRlLm5hbWUpKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICB2YWxpZGF0b3JzW3ZhbGlkYXRvclR5cGVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICQuZXh0ZW5kKFxuICAgICAgICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZm9ybWF0VmFsaWRhdG9yTmFtZSh2YWxpZGF0b3JUZW1wbGF0ZS5uYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRvclRlbXBsYXRlLmluaXQoJHRoaXMsIGVsKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgZm91bmRWYWxpZGF0b3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKCFmb3VuZFZhbGlkYXRvciAmJiBzZXR0aW5ncy5idWlsdEluVmFsaWRhdG9yc1tlbC50b0xvd2VyQ2FzZSgpXSkge1xuXG4gICAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSAkLmV4dGVuZCh0cnVlLCB7fSwgc2V0dGluZ3MuYnVpbHRJblZhbGlkYXRvcnNbZWwudG9Mb3dlckNhc2UoKV0pO1xuICAgICAgICAgICAgICBpZiAoaGFzT3ZlcnJpZGVNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRhdG9yLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHZhciB2YWxpZGF0b3JUeXBlID0gdmFsaWRhdG9yLnR5cGUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgICBpZiAodmFsaWRhdG9yVHlwZSA9PT0gXCJzaG9ydGN1dFwiKSB7XG4gICAgICAgICAgICAgICAgZm91bmRWYWxpZGF0b3IgPSB0cnVlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQuZWFjaChcbiAgICAgICAgICAgICAgICAgIHNldHRpbmdzLnZhbGlkYXRvclR5cGVzLFxuICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKHZhbGlkYXRvclRlbXBsYXRlVHlwZSwgdmFsaWRhdG9yVGVtcGxhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRvcnNbdmFsaWRhdG9yVGVtcGxhdGVUeXBlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yc1t2YWxpZGF0b3JUZW1wbGF0ZVR5cGVdID0gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFmb3VuZFZhbGlkYXRvciAmJiB2YWxpZGF0b3JUeXBlID09PSB2YWxpZGF0b3JUZW1wbGF0ZVR5cGUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIgKyBlbCArIGZvcm1hdFZhbGlkYXRvck5hbWUodmFsaWRhdG9yVGVtcGxhdGUubmFtZSksIHZhbGlkYXRvclt2YWxpZGF0b3JUZW1wbGF0ZS5uYW1lLnRvTG93ZXJDYXNlKCldKTtcbiAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3JzW3ZhbGlkYXRvclR5cGVdLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICAkLmV4dGVuZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3JUZW1wbGF0ZS5pbml0KCR0aGlzLCBlbClcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgIGZvdW5kVmFsaWRhdG9yID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCEgZm91bmRWYWxpZGF0b3IpIHtcbiAgICAgICAgICAgICAgJC5lcnJvcihcIkNhbm5vdCBmaW5kIHZhbGlkYXRpb24gaW5mbyBmb3IgJ1wiICsgZWwgKyBcIidcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNUT1JFIEZBTExCQUNLIFZBTFVFU1xuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICAgICAgICRoZWxwQmxvY2suZGF0YShcbiAgICAgICAgICAgIFwib3JpZ2luYWwtY29udGVudHNcIixcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgJGhlbHBCbG9jay5kYXRhKFwib3JpZ2luYWwtY29udGVudHNcIilcbiAgICAgICAgICAgICAgICA/ICRoZWxwQmxvY2suZGF0YShcIm9yaWdpbmFsLWNvbnRlbnRzXCIpXG4gICAgICAgICAgICAgICAgOiAkaGVscEJsb2NrLmh0bWwoKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAkaGVscEJsb2NrLmRhdGEoXG4gICAgICAgICAgICBcIm9yaWdpbmFsLXJvbGVcIixcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgJGhlbHBCbG9jay5kYXRhKFwib3JpZ2luYWwtcm9sZVwiKVxuICAgICAgICAgICAgICAgID8gJGhlbHBCbG9jay5kYXRhKFwib3JpZ2luYWwtcm9sZVwiKVxuICAgICAgICAgICAgICAgIDogJGhlbHBCbG9jay5hdHRyKFwicm9sZVwiKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAkY29udHJvbEdyb3VwLmRhdGEoXG4gICAgICAgICAgICBcIm9yaWdpbmFsLWNsYXNzZXNcIixcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgJGNvbnRyb2xHcm91cC5kYXRhKFwib3JpZ2luYWwtY2xhc2VzXCIpXG4gICAgICAgICAgICAgICAgPyAkY29udHJvbEdyb3VwLmRhdGEoXCJvcmlnaW5hbC1jbGFzc2VzXCIpXG4gICAgICAgICAgICAgICAgOiAkY29udHJvbEdyb3VwLmF0dHIoXCJjbGFzc1wiKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAkdGhpcy5kYXRhKFxuICAgICAgICAgICAgXCJvcmlnaW5hbC1hcmlhLWludmFsaWRcIixcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgJHRoaXMuZGF0YShcIm9yaWdpbmFsLWFyaWEtaW52YWxpZFwiKVxuICAgICAgICAgICAgICAgID8gJHRoaXMuZGF0YShcIm9yaWdpbmFsLWFyaWEtaW52YWxpZFwiKVxuICAgICAgICAgICAgICAgIDogJHRoaXMuYXR0cihcImFyaWEtaW52YWxpZFwiKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVkFMSURBVElPTlxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuICAgICAgICAgICR0aGlzLmJpbmQoXG4gICAgICAgICAgICBcInZhbGlkYXRpb24udmFsaWRhdGlvblwiLFxuICAgICAgICAgICAgZnVuY3Rpb24gKGV2ZW50LCBwYXJhbXMpIHtcblxuICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBnZXRWYWx1ZSgkdGhpcyk7XG5cbiAgICAgICAgICAgICAgLy8gR2V0IGEgbGlzdCBvZiB0aGUgZXJyb3JzIHRvIGFwcGx5XG4gICAgICAgICAgICAgIHZhciBlcnJvcnNGb3VuZCA9IFtdO1xuXG4gICAgICAgICAgICAgICQuZWFjaCh2YWxpZGF0b3JzLCBmdW5jdGlvbiAodmFsaWRhdG9yVHlwZSwgdmFsaWRhdG9yVHlwZUFycmF5KSB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIHx8IHZhbHVlLmxlbmd0aCB8fCAocGFyYW1zICYmIHBhcmFtcy5pbmNsdWRlRW1wdHkpIHx8ICghIXNldHRpbmdzLnZhbGlkYXRvclR5cGVzW3ZhbGlkYXRvclR5cGVdLmJsb2NrU3VibWl0ICYmIHBhcmFtcyAmJiAhIXBhcmFtcy5zdWJtaXR0aW5nKSkge1xuICAgICAgICAgICAgICAgICAgJC5lYWNoKHZhbGlkYXRvclR5cGVBcnJheSwgZnVuY3Rpb24gKGksIHZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MudmFsaWRhdG9yVHlwZXNbdmFsaWRhdG9yVHlwZV0udmFsaWRhdGUoJHRoaXMsIHZhbHVlLCB2YWxpZGF0b3IpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZXJyb3JzRm91bmQucHVzaCh2YWxpZGF0b3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIGVycm9yc0ZvdW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG5cbiAgICAgICAgICAkdGhpcy5iaW5kKFxuICAgICAgICAgICAgXCJnZXRWYWxpZGF0b3JzLnZhbGlkYXRpb25cIixcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHZhbGlkYXRvcnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdBVENIIEZPUiBDSEFOR0VTXG4gICAgICAgICAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICAgICAgICR0aGlzLmJpbmQoXG4gICAgICAgICAgICBcInN1Ym1pdC52YWxpZGF0aW9uXCIsXG4gICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHJldHVybiAkdGhpcy50cmlnZ2VySGFuZGxlcihcImNoYW5nZS52YWxpZGF0aW9uXCIsIHtzdWJtaXR0aW5nOiB0cnVlfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgKTtcbiAgICAgICAgICAkdGhpcy5iaW5kKFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBcImtleXVwXCIsXG4gICAgICAgICAgICAgIFwiZm9jdXNcIixcbiAgICAgICAgICAgICAgXCJibHVyXCIsXG4gICAgICAgICAgICAgIFwiY2xpY2tcIixcbiAgICAgICAgICAgICAgXCJrZXlkb3duXCIsXG4gICAgICAgICAgICAgIFwia2V5cHJlc3NcIixcbiAgICAgICAgICAgICAgXCJjaGFuZ2VcIlxuICAgICAgICAgICAgXS5qb2luKFwiLnZhbGlkYXRpb24gXCIpICsgXCIudmFsaWRhdGlvblwiLFxuICAgICAgICAgICAgZnVuY3Rpb24gKGUsIHBhcmFtcykge1xuXG4gICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGdldFZhbHVlKCR0aGlzKTtcblxuICAgICAgICAgICAgICB2YXIgZXJyb3JzRm91bmQgPSBbXTtcblxuICAgICAgICAgICAgICAkY29udHJvbEdyb3VwLmZpbmQoXCJpbnB1dCx0ZXh0YXJlYSxzZWxlY3RcIikuZWFjaChmdW5jdGlvbiAoaSwgZWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkQ291bnQgPSBlcnJvcnNGb3VuZC5sZW5ndGg7XG4gICAgICAgICAgICAgICAgJC5lYWNoKCQoZWwpLnRyaWdnZXJIYW5kbGVyKFwidmFsaWRhdGlvbi52YWxpZGF0aW9uXCIsIHBhcmFtcyksIGZ1bmN0aW9uIChqLCBtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICBlcnJvcnNGb3VuZC5wdXNoKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcnNGb3VuZC5sZW5ndGggPiBvbGRDb3VudCkge1xuICAgICAgICAgICAgICAgICAgJChlbCkuYXR0cihcImFyaWEtaW52YWxpZFwiLCBcInRydWVcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHZhciBvcmlnaW5hbCA9ICR0aGlzLmRhdGEoXCJvcmlnaW5hbC1hcmlhLWludmFsaWRcIik7XG4gICAgICAgICAgICAgICAgICAkKGVsKS5hdHRyKFwiYXJpYS1pbnZhbGlkXCIsIChvcmlnaW5hbCAhPT0gdW5kZWZpbmVkID8gb3JpZ2luYWwgOiBmYWxzZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgJGZvcm0uZmluZChcImlucHV0LHNlbGVjdCx0ZXh0YXJlYVwiKS5ub3QoJHRoaXMpLm5vdChcIltuYW1lPVxcXCJcIiArICR0aGlzLmF0dHIoXCJuYW1lXCIpICsgXCJcXFwiXVwiKS50cmlnZ2VyKFwidmFsaWRhdGlvbkxvc3RGb2N1cy52YWxpZGF0aW9uXCIpO1xuXG4gICAgICAgICAgICAgIGVycm9yc0ZvdW5kID0gJC51bmlxdWUoZXJyb3JzRm91bmQuc29ydCgpKTtcblxuICAgICAgICAgICAgICAvLyBXZXJlIHRoZXJlIGFueSBlcnJvcnM/XG4gICAgICAgICAgICAgIGlmIChlcnJvcnNGb3VuZC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyBCZXR0ZXIgZmxhZyBpdCB1cCBhcyBhIHdhcm5pbmcuXG4gICAgICAgICAgICAgICAgJGNvbnRyb2xHcm91cC5yZW1vdmVDbGFzcyhcInN1Y2Nlc3MgZXJyb3JcIikuYWRkQ2xhc3MoXCJ3YXJuaW5nXCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gSG93IG1hbnkgZXJyb3JzIGRpZCB3ZSBmaW5kP1xuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5vcHRpb25zLnNlbWFudGljYWxseVN0cmljdCAmJiBlcnJvcnNGb3VuZC5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgIC8vIE9ubHkgb25lPyBCZWluZyBzdHJpY3Q/IEp1c3Qgb3V0cHV0IGl0LlxuICAgICAgICAgICAgICAgICAgJGhlbHBCbG9jay5odG1sKGVycm9yc0ZvdW5kWzBdICsgXG4gICAgICAgICAgICAgICAgICAgICggc2V0dGluZ3Mub3B0aW9ucy5wcmVwZW5kRXhpc3RpbmdIZWxwQmxvY2sgPyAkaGVscEJsb2NrLmRhdGEoXCJvcmlnaW5hbC1jb250ZW50c1wiKSA6IFwiXCIgKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIC8vIE11bHRpcGxlPyBCZWluZyBzbG9wcHk/IEdsdWUgdGhlbSB0b2dldGhlciBpbnRvIGFuIFVMLlxuICAgICAgICAgICAgICAgICAgJGhlbHBCbG9jay5odG1sKFwiPHVsIHJvbGU9XFxcImFsZXJ0XFxcIj48bGk+XCIgKyBlcnJvcnNGb3VuZC5qb2luKFwiPC9saT48bGk+XCIpICsgXCI8L2xpPjwvdWw+XCIgK1xuICAgICAgICAgICAgICAgICAgICAoIHNldHRpbmdzLm9wdGlvbnMucHJlcGVuZEV4aXN0aW5nSGVscEJsb2NrID8gJGhlbHBCbG9jay5kYXRhKFwib3JpZ2luYWwtY29udGVudHNcIikgOiBcIlwiICkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkY29udHJvbEdyb3VwLnJlbW92ZUNsYXNzKFwid2FybmluZyBlcnJvciBzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAkY29udHJvbEdyb3VwLmFkZENsYXNzKFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJGhlbHBCbG9jay5odG1sKCRoZWxwQmxvY2suZGF0YShcIm9yaWdpbmFsLWNvbnRlbnRzXCIpKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChlLnR5cGUgPT09IFwiYmx1clwiKSB7XG4gICAgICAgICAgICAgICAgJGNvbnRyb2xHcm91cC5yZW1vdmVDbGFzcyhcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICApO1xuICAgICAgICAgICR0aGlzLmJpbmQoXCJ2YWxpZGF0aW9uTG9zdEZvY3VzLnZhbGlkYXRpb25cIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJGNvbnRyb2xHcm91cC5yZW1vdmVDbGFzcyhcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGRlc3Ryb3kgOiBmdW5jdGlvbiggKSB7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChcbiAgICAgICAgICBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgdmFyXG4gICAgICAgICAgICAgICR0aGlzID0gJCh0aGlzKSxcbiAgICAgICAgICAgICAgJGNvbnRyb2xHcm91cCA9ICR0aGlzLnBhcmVudHMoXCIuZm9ybS1ncm91cFwiKS5maXJzdCgpLFxuICAgICAgICAgICAgICAkaGVscEJsb2NrID0gJGNvbnRyb2xHcm91cC5maW5kKFwiLmhlbHAtYmxvY2tcIikuZmlyc3QoKTtcblxuICAgICAgICAgICAgLy8gcmVtb3ZlIG91ciBldmVudHNcbiAgICAgICAgICAgICR0aGlzLnVuYmluZCgnLnZhbGlkYXRpb24nKTsgLy8gZXZlbnRzIGFyZSBuYW1lc3BhY2VkLlxuICAgICAgICAgICAgLy8gcmVzZXQgaGVscCB0ZXh0XG4gICAgICAgICAgICAkaGVscEJsb2NrLmh0bWwoJGhlbHBCbG9jay5kYXRhKFwib3JpZ2luYWwtY29udGVudHNcIikpO1xuICAgICAgICAgICAgLy8gcmVzZXQgY2xhc3Nlc1xuICAgICAgICAgICAgJGNvbnRyb2xHcm91cC5hdHRyKFwiY2xhc3NcIiwgJGNvbnRyb2xHcm91cC5kYXRhKFwib3JpZ2luYWwtY2xhc3Nlc1wiKSk7XG4gICAgICAgICAgICAvLyByZXNldCBhcmlhXG4gICAgICAgICAgICAkdGhpcy5hdHRyKFwiYXJpYS1pbnZhbGlkXCIsICR0aGlzLmRhdGEoXCJvcmlnaW5hbC1hcmlhLWludmFsaWRcIikpO1xuICAgICAgICAgICAgLy8gcmVzZXQgcm9sZVxuICAgICAgICAgICAgJGhlbHBCbG9jay5hdHRyKFwicm9sZVwiLCAkdGhpcy5kYXRhKFwib3JpZ2luYWwtcm9sZVwiKSk7XG5cdFx0XHRcdFx0XHQvLyByZW1vdmUgYWxsIGVsZW1lbnRzIHdlIGNyZWF0ZWRcblx0XHRcdFx0XHRcdGlmIChjcmVhdGVkRWxlbWVudHMuaW5kZXhPZigkaGVscEJsb2NrWzBdKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdCRoZWxwQmxvY2sucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHR9XG5cbiAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICAgIH0sXG4gICAgICBjb2xsZWN0RXJyb3JzIDogZnVuY3Rpb24oaW5jbHVkZUVtcHR5KSB7XG5cbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZXMgPSB7fTtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgIHZhciAkZWwgPSAkKGVsKTtcbiAgICAgICAgICB2YXIgbmFtZSA9ICRlbC5hdHRyKFwibmFtZVwiKTtcbiAgICAgICAgICB2YXIgZXJyb3JzID0gJGVsLnRyaWdnZXJIYW5kbGVyKFwidmFsaWRhdGlvbi52YWxpZGF0aW9uXCIsIHtpbmNsdWRlRW1wdHk6IHRydWV9KTtcbiAgICAgICAgICBlcnJvck1lc3NhZ2VzW25hbWVdID0gJC5leHRlbmQodHJ1ZSwgZXJyb3JzLCBlcnJvck1lc3NhZ2VzW25hbWVdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJC5lYWNoKGVycm9yTWVzc2FnZXMsIGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgIGlmIChlbC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBlcnJvck1lc3NhZ2VzW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGVycm9yTWVzc2FnZXM7XG5cbiAgICAgIH0sXG4gICAgICBoYXNFcnJvcnM6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBlcnJvck1lc3NhZ2VzID0gW107XG5cbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uIChpLCBlbCkge1xuICAgICAgICAgIGVycm9yTWVzc2FnZXMgPSBlcnJvck1lc3NhZ2VzLmNvbmNhdChcbiAgICAgICAgICAgICQoZWwpLnRyaWdnZXJIYW5kbGVyKFwiZ2V0VmFsaWRhdG9ycy52YWxpZGF0aW9uXCIpID8gJChlbCkudHJpZ2dlckhhbmRsZXIoXCJ2YWxpZGF0aW9uLnZhbGlkYXRpb25cIiwge3N1Ym1pdHRpbmc6IHRydWV9KSA6IFtdXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChlcnJvck1lc3NhZ2VzLmxlbmd0aCA+IDApO1xuICAgICAgfSxcbiAgICAgIG92ZXJyaWRlIDogZnVuY3Rpb24gKG5ld0RlZmF1bHRzKSB7XG4gICAgICAgIGRlZmF1bHRzID0gJC5leHRlbmQodHJ1ZSwgZGVmYXVsdHMsIG5ld0RlZmF1bHRzKTtcbiAgICAgIH1cbiAgICB9LFxuXHRcdHZhbGlkYXRvclR5cGVzOiB7XG4gICAgICBjYWxsYmFjazoge1xuICAgICAgICBuYW1lOiBcImNhbGxiYWNrXCIsXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uICgkdGhpcywgbmFtZSkge1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWxpZGF0b3JOYW1lOiBuYW1lLFxuICAgICAgICAgICAgY2FsbGJhY2s6ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIgKyBuYW1lICsgXCJDYWxsYmFja1wiKSxcbiAgICAgICAgICAgIGxhc3RWYWx1ZTogJHRoaXMudmFsKCksXG4gICAgICAgICAgICBsYXN0VmFsaWQ6IHRydWUsXG4gICAgICAgICAgICBsYXN0RmluaXNoZWQ6IHRydWVcbiAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2YWxpZGF0ZTogZnVuY3Rpb24gKCR0aGlzLCB2YWx1ZSwgdmFsaWRhdG9yKSB7XG4gICAgICAgICAgaWYgKHZhbGlkYXRvci5sYXN0VmFsdWUgPT09IHZhbHVlICYmIHZhbGlkYXRvci5sYXN0RmluaXNoZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAhdmFsaWRhdG9yLmxhc3RWYWxpZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodmFsaWRhdG9yLmxhc3RGaW5pc2hlZCA9PT0gdHJ1ZSlcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWxpZGF0b3IubGFzdFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB2YWxpZGF0b3IubGFzdFZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhbGlkYXRvci5sYXN0RmluaXNoZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgdmFyIHJyanFidlZhbGlkYXRvciA9IHZhbGlkYXRvcjtcbiAgICAgICAgICAgIHZhciBycmpxYnZUaGlzID0gJHRoaXM7XG4gICAgICAgICAgICBleGVjdXRlRnVuY3Rpb25CeU5hbWUoXG4gICAgICAgICAgICAgIHZhbGlkYXRvci5jYWxsYmFjayxcbiAgICAgICAgICAgICAgd2luZG93LFxuICAgICAgICAgICAgICAkdGhpcyxcbiAgICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICAgIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJyanFidlZhbGlkYXRvci5sYXN0VmFsdWUgPT09IGRhdGEudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgIHJyanFidlZhbGlkYXRvci5sYXN0VmFsaWQgPSBkYXRhLnZhbGlkO1xuICAgICAgICAgICAgICAgICAgaWYgKGRhdGEubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICBycmpxYnZWYWxpZGF0b3IubWVzc2FnZSA9IGRhdGEubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHJyanFidlZhbGlkYXRvci5sYXN0RmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgcnJqcWJ2VGhpcy5kYXRhKFwidmFsaWRhdGlvblwiICsgcnJqcWJ2VmFsaWRhdG9yLnZhbGlkYXRvck5hbWUgKyBcIk1lc3NhZ2VcIiwgcnJqcWJ2VmFsaWRhdG9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgLy8gVGltZW91dCBpcyBzZXQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCB0aGUgZXZlbnRzIGJlaW5nIGNvbnNpZGVyZWQgJ2FscmVhZHkgZmlyZWQnXG4gICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcnJqcWJ2VGhpcy50cmlnZ2VyKFwiY2hhbmdlLnZhbGlkYXRpb25cIik7XG4gICAgICAgICAgICAgICAgICB9LCAxKTsgLy8gZG9lc24ndCBuZWVkIGEgbG9uZyB0aW1lb3V0LCBqdXN0IGxvbmcgZW5vdWdoIGZvciB0aGUgZXZlbnQgYnViYmxlIHRvIGJ1cnN0XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgYWpheDoge1xuICAgICAgICBuYW1lOiBcImFqYXhcIixcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKCR0aGlzLCBuYW1lKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhbGlkYXRvck5hbWU6IG5hbWUsXG4gICAgICAgICAgICB1cmw6ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIgKyBuYW1lICsgXCJBamF4XCIpLFxuICAgICAgICAgICAgbGFzdFZhbHVlOiAkdGhpcy52YWwoKSxcbiAgICAgICAgICAgIGxhc3RWYWxpZDogdHJ1ZSxcbiAgICAgICAgICAgIGxhc3RGaW5pc2hlZDogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZhbGlkYXRlOiBmdW5jdGlvbiAoJHRoaXMsIHZhbHVlLCB2YWxpZGF0b3IpIHtcbiAgICAgICAgICBpZiAoXCJcIit2YWxpZGF0b3IubGFzdFZhbHVlID09PSBcIlwiK3ZhbHVlICYmIHZhbGlkYXRvci5sYXN0RmluaXNoZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHJldHVybiB2YWxpZGF0b3IubGFzdFZhbGlkID09PSBmYWxzZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAodmFsaWRhdG9yLmxhc3RGaW5pc2hlZCA9PT0gdHJ1ZSlcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2YWxpZGF0b3IubGFzdFZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB2YWxpZGF0b3IubGFzdFZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhbGlkYXRvci5sYXN0RmluaXNoZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgIHVybDogdmFsaWRhdG9yLnVybCxcbiAgICAgICAgICAgICAgZGF0YTogXCJ2YWx1ZT1cIiArIHZhbHVlICsgXCImZmllbGQ9XCIgKyAkdGhpcy5hdHRyKFwibmFtZVwiKSxcbiAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChcIlwiK3ZhbGlkYXRvci5sYXN0VmFsdWUgPT09IFwiXCIrZGF0YS52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yLmxhc3RWYWxpZCA9ICEhKGRhdGEudmFsaWQpO1xuICAgICAgICAgICAgICAgICAgaWYgKGRhdGEubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3IubWVzc2FnZSA9IGRhdGEubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHZhbGlkYXRvci5sYXN0RmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgJHRoaXMuZGF0YShcInZhbGlkYXRpb25cIiArIHZhbGlkYXRvci52YWxpZGF0b3JOYW1lICsgXCJNZXNzYWdlXCIsIHZhbGlkYXRvci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgIC8vIFRpbWVvdXQgaXMgc2V0IHRvIGF2b2lkIHByb2JsZW1zIHdpdGggdGhlIGV2ZW50cyBiZWluZyBjb25zaWRlcmVkICdhbHJlYWR5IGZpcmVkJ1xuICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICR0aGlzLnRyaWdnZXIoXCJjaGFuZ2UudmFsaWRhdGlvblwiKTtcbiAgICAgICAgICAgICAgICAgIH0sIDEpOyAvLyBkb2Vzbid0IG5lZWQgYSBsb25nIHRpbWVvdXQsIGp1c3QgbG9uZyBlbm91Z2ggZm9yIHRoZSBldmVudCBidWJibGUgdG8gYnVyc3RcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGZhaWx1cmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IubGFzdFZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IubWVzc2FnZSA9IFwiYWpheCBjYWxsIGZhaWxlZFwiO1xuICAgICAgICAgICAgICAgIHZhbGlkYXRvci5sYXN0RmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIgKyB2YWxpZGF0b3IudmFsaWRhdG9yTmFtZSArIFwiTWVzc2FnZVwiLCB2YWxpZGF0b3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgLy8gVGltZW91dCBpcyBzZXQgdG8gYXZvaWQgcHJvYmxlbXMgd2l0aCB0aGUgZXZlbnRzIGJlaW5nIGNvbnNpZGVyZWQgJ2FscmVhZHkgZmlyZWQnXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAkdGhpcy50cmlnZ2VyKFwiY2hhbmdlLnZhbGlkYXRpb25cIik7XG4gICAgICAgICAgICAgICAgfSwgMSk7IC8vIGRvZXNuJ3QgbmVlZCBhIGxvbmcgdGltZW91dCwganVzdCBsb25nIGVub3VnaCBmb3IgdGhlIGV2ZW50IGJ1YmJsZSB0byBidXJzdFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgfVxuICAgICAgfSxcblx0XHRcdHJlZ2V4OiB7XG5cdFx0XHRcdG5hbWU6IFwicmVnZXhcIixcblx0XHRcdFx0aW5pdDogZnVuY3Rpb24gKCR0aGlzLCBuYW1lKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtyZWdleDogcmVnZXhGcm9tU3RyaW5nKCR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIgKyBuYW1lICsgXCJSZWdleFwiKSl9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKCR0aGlzLCB2YWx1ZSwgdmFsaWRhdG9yKSB7XG5cdFx0XHRcdFx0cmV0dXJuICghdmFsaWRhdG9yLnJlZ2V4LnRlc3QodmFsdWUpICYmICEgdmFsaWRhdG9yLm5lZ2F0aXZlKVxuXHRcdFx0XHRcdFx0fHwgKHZhbGlkYXRvci5yZWdleC50ZXN0KHZhbHVlKSAmJiB2YWxpZGF0b3IubmVnYXRpdmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0cmVxdWlyZWQ6IHtcblx0XHRcdFx0bmFtZTogXCJyZXF1aXJlZFwiLFxuXHRcdFx0XHRpbml0OiBmdW5jdGlvbiAoJHRoaXMsIG5hbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHZhbGlkYXRlOiBmdW5jdGlvbiAoJHRoaXMsIHZhbHVlLCB2YWxpZGF0b3IpIHtcblx0XHRcdFx0XHRyZXR1cm4gISEodmFsdWUubGVuZ3RoID09PSAwICAmJiAhIHZhbGlkYXRvci5uZWdhdGl2ZSlcblx0XHRcdFx0XHRcdHx8ICEhKHZhbHVlLmxlbmd0aCA+IDAgJiYgdmFsaWRhdG9yLm5lZ2F0aXZlKTtcblx0XHRcdFx0fSxcbiAgICAgICAgYmxvY2tTdWJtaXQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRtYXRjaDoge1xuXHRcdFx0XHRuYW1lOiBcIm1hdGNoXCIsXG5cdFx0XHRcdGluaXQ6IGZ1bmN0aW9uICgkdGhpcywgbmFtZSkge1xuXHRcdFx0XHRcdHZhciBlbGVtZW50ID0gJHRoaXMucGFyZW50cyhcImZvcm1cIikuZmlyc3QoKS5maW5kKFwiW25hbWU9XFxcIlwiICsgJHRoaXMuZGF0YShcInZhbGlkYXRpb25cIiArIG5hbWUgKyBcIk1hdGNoXCIpICsgXCJcXFwiXVwiKS5maXJzdCgpO1xuXHRcdFx0XHRcdGVsZW1lbnQuYmluZChcInZhbGlkYXRpb24udmFsaWRhdGlvblwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQkdGhpcy50cmlnZ2VyKFwiY2hhbmdlLnZhbGlkYXRpb25cIiwge3N1Ym1pdHRpbmc6IHRydWV9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRyZXR1cm4ge1wiZWxlbWVudFwiOiBlbGVtZW50fTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dmFsaWRhdGU6IGZ1bmN0aW9uICgkdGhpcywgdmFsdWUsIHZhbGlkYXRvcikge1xuXHRcdFx0XHRcdHJldHVybiAodmFsdWUgIT09IHZhbGlkYXRvci5lbGVtZW50LnZhbCgpICYmICEgdmFsaWRhdG9yLm5lZ2F0aXZlKVxuXHRcdFx0XHRcdFx0fHwgKHZhbHVlID09PSB2YWxpZGF0b3IuZWxlbWVudC52YWwoKSAmJiB2YWxpZGF0b3IubmVnYXRpdmUpO1xuXHRcdFx0XHR9LFxuICAgICAgICBibG9ja1N1Ym1pdDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdG1heDoge1xuXHRcdFx0XHRuYW1lOiBcIm1heFwiLFxuXHRcdFx0XHRpbml0OiBmdW5jdGlvbiAoJHRoaXMsIG5hbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4ge21heDogJHRoaXMuZGF0YShcInZhbGlkYXRpb25cIiArIG5hbWUgKyBcIk1heFwiKX07XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHZhbGlkYXRlOiBmdW5jdGlvbiAoJHRoaXMsIHZhbHVlLCB2YWxpZGF0b3IpIHtcblx0XHRcdFx0XHRyZXR1cm4gKHBhcnNlRmxvYXQodmFsdWUsIDEwKSA+IHBhcnNlRmxvYXQodmFsaWRhdG9yLm1heCwgMTApICYmICEgdmFsaWRhdG9yLm5lZ2F0aXZlKVxuXHRcdFx0XHRcdFx0fHwgKHBhcnNlRmxvYXQodmFsdWUsIDEwKSA8PSBwYXJzZUZsb2F0KHZhbGlkYXRvci5tYXgsIDEwKSAmJiB2YWxpZGF0b3IubmVnYXRpdmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0bWluOiB7XG5cdFx0XHRcdG5hbWU6IFwibWluXCIsXG5cdFx0XHRcdGluaXQ6IGZ1bmN0aW9uICgkdGhpcywgbmFtZSkge1xuXHRcdFx0XHRcdHJldHVybiB7bWluOiAkdGhpcy5kYXRhKFwidmFsaWRhdGlvblwiICsgbmFtZSArIFwiTWluXCIpfTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dmFsaWRhdGU6IGZ1bmN0aW9uICgkdGhpcywgdmFsdWUsIHZhbGlkYXRvcikge1xuXHRcdFx0XHRcdHJldHVybiAocGFyc2VGbG9hdCh2YWx1ZSkgPCBwYXJzZUZsb2F0KHZhbGlkYXRvci5taW4pICYmICEgdmFsaWRhdG9yLm5lZ2F0aXZlKVxuXHRcdFx0XHRcdFx0fHwgKHBhcnNlRmxvYXQodmFsdWUpID49IHBhcnNlRmxvYXQodmFsaWRhdG9yLm1pbikgJiYgdmFsaWRhdG9yLm5lZ2F0aXZlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdG1heGxlbmd0aDoge1xuXHRcdFx0XHRuYW1lOiBcIm1heGxlbmd0aFwiLFxuXHRcdFx0XHRpbml0OiBmdW5jdGlvbiAoJHRoaXMsIG5hbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4ge21heGxlbmd0aDogJHRoaXMuZGF0YShcInZhbGlkYXRpb25cIiArIG5hbWUgKyBcIk1heGxlbmd0aFwiKX07XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHZhbGlkYXRlOiBmdW5jdGlvbiAoJHRoaXMsIHZhbHVlLCB2YWxpZGF0b3IpIHtcblx0XHRcdFx0XHRyZXR1cm4gKCh2YWx1ZS5sZW5ndGggPiB2YWxpZGF0b3IubWF4bGVuZ3RoKSAmJiAhIHZhbGlkYXRvci5uZWdhdGl2ZSlcblx0XHRcdFx0XHRcdHx8ICgodmFsdWUubGVuZ3RoIDw9IHZhbGlkYXRvci5tYXhsZW5ndGgpICYmIHZhbGlkYXRvci5uZWdhdGl2ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRtaW5sZW5ndGg6IHtcblx0XHRcdFx0bmFtZTogXCJtaW5sZW5ndGhcIixcblx0XHRcdFx0aW5pdDogZnVuY3Rpb24gKCR0aGlzLCBuYW1lKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHttaW5sZW5ndGg6ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIgKyBuYW1lICsgXCJNaW5sZW5ndGhcIil9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKCR0aGlzLCB2YWx1ZSwgdmFsaWRhdG9yKSB7XG5cdFx0XHRcdFx0cmV0dXJuICgodmFsdWUubGVuZ3RoIDwgdmFsaWRhdG9yLm1pbmxlbmd0aCkgJiYgISB2YWxpZGF0b3IubmVnYXRpdmUpXG5cdFx0XHRcdFx0XHR8fCAoKHZhbHVlLmxlbmd0aCA+PSB2YWxpZGF0b3IubWlubGVuZ3RoKSAmJiB2YWxpZGF0b3IubmVnYXRpdmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0bWF4Y2hlY2tlZDoge1xuXHRcdFx0XHRuYW1lOiBcIm1heGNoZWNrZWRcIixcblx0XHRcdFx0aW5pdDogZnVuY3Rpb24gKCR0aGlzLCBuYW1lKSB7XG5cdFx0XHRcdFx0dmFyIGVsZW1lbnRzID0gJHRoaXMucGFyZW50cyhcImZvcm1cIikuZmlyc3QoKS5maW5kKFwiW25hbWU9XFxcIlwiICsgJHRoaXMuYXR0cihcIm5hbWVcIikgKyBcIlxcXCJdXCIpO1xuXHRcdFx0XHRcdGVsZW1lbnRzLmJpbmQoXCJjbGljay52YWxpZGF0aW9uXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdCR0aGlzLnRyaWdnZXIoXCJjaGFuZ2UudmFsaWRhdGlvblwiLCB7aW5jbHVkZUVtcHR5OiB0cnVlfSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuIHttYXhjaGVja2VkOiAkdGhpcy5kYXRhKFwidmFsaWRhdGlvblwiICsgbmFtZSArIFwiTWF4Y2hlY2tlZFwiKSwgZWxlbWVudHM6IGVsZW1lbnRzfTtcblx0XHRcdFx0fSxcblx0XHRcdFx0dmFsaWRhdGU6IGZ1bmN0aW9uICgkdGhpcywgdmFsdWUsIHZhbGlkYXRvcikge1xuXHRcdFx0XHRcdHJldHVybiAodmFsaWRhdG9yLmVsZW1lbnRzLmZpbHRlcihcIjpjaGVja2VkXCIpLmxlbmd0aCA+IHZhbGlkYXRvci5tYXhjaGVja2VkICYmICEgdmFsaWRhdG9yLm5lZ2F0aXZlKVxuXHRcdFx0XHRcdFx0fHwgKHZhbGlkYXRvci5lbGVtZW50cy5maWx0ZXIoXCI6Y2hlY2tlZFwiKS5sZW5ndGggPD0gdmFsaWRhdG9yLm1heGNoZWNrZWQgJiYgdmFsaWRhdG9yLm5lZ2F0aXZlKTtcblx0XHRcdFx0fSxcbiAgICAgICAgYmxvY2tTdWJtaXQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRtaW5jaGVja2VkOiB7XG5cdFx0XHRcdG5hbWU6IFwibWluY2hlY2tlZFwiLFxuXHRcdFx0XHRpbml0OiBmdW5jdGlvbiAoJHRoaXMsIG5hbWUpIHtcblx0XHRcdFx0XHR2YXIgZWxlbWVudHMgPSAkdGhpcy5wYXJlbnRzKFwiZm9ybVwiKS5maXJzdCgpLmZpbmQoXCJbbmFtZT1cXFwiXCIgKyAkdGhpcy5hdHRyKFwibmFtZVwiKSArIFwiXFxcIl1cIik7XG5cdFx0XHRcdFx0ZWxlbWVudHMuYmluZChcImNsaWNrLnZhbGlkYXRpb25cIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0JHRoaXMudHJpZ2dlcihcImNoYW5nZS52YWxpZGF0aW9uXCIsIHtpbmNsdWRlRW1wdHk6IHRydWV9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRyZXR1cm4ge21pbmNoZWNrZWQ6ICR0aGlzLmRhdGEoXCJ2YWxpZGF0aW9uXCIgKyBuYW1lICsgXCJNaW5jaGVja2VkXCIpLCBlbGVtZW50czogZWxlbWVudHN9O1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKCR0aGlzLCB2YWx1ZSwgdmFsaWRhdG9yKSB7XG5cdFx0XHRcdFx0cmV0dXJuICh2YWxpZGF0b3IuZWxlbWVudHMuZmlsdGVyKFwiOmNoZWNrZWRcIikubGVuZ3RoIDwgdmFsaWRhdG9yLm1pbmNoZWNrZWQgJiYgISB2YWxpZGF0b3IubmVnYXRpdmUpXG5cdFx0XHRcdFx0XHR8fCAodmFsaWRhdG9yLmVsZW1lbnRzLmZpbHRlcihcIjpjaGVja2VkXCIpLmxlbmd0aCA+PSB2YWxpZGF0b3IubWluY2hlY2tlZCAmJiB2YWxpZGF0b3IubmVnYXRpdmUpO1xuXHRcdFx0XHR9LFxuICAgICAgICBibG9ja1N1Ym1pdDogdHJ1ZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YnVpbHRJblZhbGlkYXRvcnM6IHtcblx0XHRcdGVtYWlsOiB7XG5cdFx0XHRcdG5hbWU6IFwiRW1haWxcIixcblx0XHRcdFx0dHlwZTogXCJzaG9ydGN1dFwiLFxuXHRcdFx0XHRzaG9ydGN1dDogXCJ2YWxpZGVtYWlsXCJcblx0XHRcdH0sXG5cdFx0XHR2YWxpZGVtYWlsOiB7XG5cdFx0XHRcdG5hbWU6IFwiVmFsaWRlbWFpbFwiLFxuXHRcdFx0XHR0eXBlOiBcInJlZ2V4XCIsXG5cdFx0XHRcdHJlZ2V4OiBcIltBLVphLXowLTkuXyUrLV0rQFtBLVphLXowLTkuLV0rXFxcXFxcLltBLVphLXpdezIsNH1cIixcblx0XHRcdFx0bWVzc2FnZTogXCLQndC10L/RgNCw0LLQuNC70YzQvdGL0LkgZW1haWwg0LDQtNGA0LXRgTwhLS0gZGF0YS12YWxpZGF0b3ItdmFsaWRlbWFpbC1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiXG5cdFx0XHR9LFxuXHRcdFx0cGFzc3dvcmRhZ2Fpbjoge1xuXHRcdFx0XHRuYW1lOiBcIlBhc3N3b3JkYWdhaW5cIixcblx0XHRcdFx0dHlwZTogXCJtYXRjaFwiLFxuXHRcdFx0XHRtYXRjaDogXCJwYXNzd29yZFwiLFxuXHRcdFx0XHRtZXNzYWdlOiBcItCd0LXQv9GA0LDQstC40LvRjNC90YvQuSDQv9Cw0YDQvtC70Yw8IS0tIGRhdGEtdmFsaWRhdG9yLXBhc3dvcmRhZ2Fpbi1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiXG5cdFx0XHR9LFxuXHRcdFx0cG9zaXRpdmU6IHtcblx0XHRcdFx0bmFtZTogXCJQb3NpdGl2ZVwiLFxuXHRcdFx0XHR0eXBlOiBcInNob3J0Y3V0XCIsXG5cdFx0XHRcdHNob3J0Y3V0OiBcIm51bWJlcixwb3NpdGl2ZW51bWJlclwiXG5cdFx0XHR9LFxuXHRcdFx0bmVnYXRpdmU6IHtcblx0XHRcdFx0bmFtZTogXCJOZWdhdGl2ZVwiLFxuXHRcdFx0XHR0eXBlOiBcInNob3J0Y3V0XCIsXG5cdFx0XHRcdHNob3J0Y3V0OiBcIm51bWJlcixuZWdhdGl2ZW51bWJlclwiXG5cdFx0XHR9LFxuXHRcdFx0bnVtYmVyOiB7XG5cdFx0XHRcdG5hbWU6IFwiTnVtYmVyXCIsXG5cdFx0XHRcdHR5cGU6IFwicmVnZXhcIixcblx0XHRcdFx0cmVnZXg6IFwiKFsrLV0/XFxcXFxcZCsoXFxcXFxcLlxcXFxcXGQqKT8oW2VFXVsrLV0/WzAtOV0rKT8pP1wiLFxuXHRcdFx0XHRtZXNzYWdlOiBcIk11c3QgYmUgYSBudW1iZXI8IS0tIGRhdGEtdmFsaWRhdG9yLW51bWJlci1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiXG5cdFx0XHR9LFxuXHRcdFx0aW50ZWdlcjoge1xuXHRcdFx0XHRuYW1lOiBcIkludGVnZXJcIixcblx0XHRcdFx0dHlwZTogXCJyZWdleFwiLFxuXHRcdFx0XHRyZWdleDogXCJbKy1dP1xcXFxcXGQrXCIsXG5cdFx0XHRcdG1lc3NhZ2U6IFwiTm8gZGVjaW1hbCBwbGFjZXMgYWxsb3dlZDwhLS0gZGF0YS12YWxpZGF0b3ItaW50ZWdlci1tZXNzYWdlIHRvIG92ZXJyaWRlIC0tPlwiXG5cdFx0XHR9LFxuXHRcdFx0cG9zaXRpdmVudW1iZXI6IHtcblx0XHRcdFx0bmFtZTogXCJQb3NpdGl2ZW51bWJlclwiLFxuXHRcdFx0XHR0eXBlOiBcIm1pblwiLFxuXHRcdFx0XHRtaW46IDAsXG5cdFx0XHRcdG1lc3NhZ2U6IFwiTXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcjwhLS0gZGF0YS12YWxpZGF0b3ItcG9zaXRpdmVudW1iZXItbWVzc2FnZSB0byBvdmVycmlkZSAtLT5cIlxuXHRcdFx0fSxcblx0XHRcdG5lZ2F0aXZlbnVtYmVyOiB7XG5cdFx0XHRcdG5hbWU6IFwiTmVnYXRpdmVudW1iZXJcIixcblx0XHRcdFx0dHlwZTogXCJtYXhcIixcblx0XHRcdFx0bWF4OiAwLFxuXHRcdFx0XHRtZXNzYWdlOiBcIk11c3QgYmUgYSBuZWdhdGl2ZSBudW1iZXI8IS0tIGRhdGEtdmFsaWRhdG9yLW5lZ2F0aXZlbnVtYmVyLW1lc3NhZ2UgdG8gb3ZlcnJpZGUgLS0+XCJcblx0XHRcdH0sXG5cdFx0XHRyZXF1aXJlZDoge1xuXHRcdFx0XHRuYW1lOiBcIlJlcXVpcmVkXCIsXG5cdFx0XHRcdHR5cGU6IFwicmVxdWlyZWRcIixcblx0XHRcdFx0bWVzc2FnZTogXCLQntCx0Y/Qt9Cw0YLQtdC70YzQvdC+INC00LvRjyDQt9Cw0L/QvtC70L3QtdC90LjRjzwhLS0gZGF0YS12YWxpZGF0b3ItcmVxdWlyZWQtbWVzc2FnZSB0byBvdmVycmlkZSAtLT5cIlxuXHRcdFx0fSxcblx0XHRcdGNoZWNrb25lOiB7XG5cdFx0XHRcdG5hbWU6IFwiQ2hlY2tvbmVcIixcblx0XHRcdFx0dHlwZTogXCJtaW5jaGVja2VkXCIsXG5cdFx0XHRcdG1pbmNoZWNrZWQ6IDEsXG5cdFx0XHRcdG1lc3NhZ2U6IFwiQ2hlY2sgYXQgbGVhc3Qgb25lIG9wdGlvbjwhLS0gZGF0YS12YWxpZGF0aW9uLWNoZWNrb25lLW1lc3NhZ2UgdG8gb3ZlcnJpZGUgLS0+XCJcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0dmFyIGZvcm1hdFZhbGlkYXRvck5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuXHRcdHJldHVybiBuYW1lXG5cdFx0XHQudG9Mb3dlckNhc2UoKVxuXHRcdFx0LnJlcGxhY2UoXG5cdFx0XHRcdC8oXnxcXHMpKFthLXpdKS9nICxcblx0XHRcdFx0ZnVuY3Rpb24obSxwMSxwMikge1xuXHRcdFx0XHRcdHJldHVybiBwMStwMi50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHQpXG5cdFx0O1xuXHR9O1xuXG5cdHZhciBnZXRWYWx1ZSA9IGZ1bmN0aW9uICgkdGhpcykge1xuXHRcdC8vIEV4dHJhY3QgdGhlIHZhbHVlIHdlJ3JlIHRhbGtpbmcgYWJvdXRcblx0XHR2YXIgdmFsdWUgPSAkdGhpcy52YWwoKTtcblx0XHR2YXIgdHlwZSA9ICR0aGlzLmF0dHIoXCJ0eXBlXCIpO1xuXHRcdGlmICh0eXBlID09PSBcImNoZWNrYm94XCIpIHtcblx0XHRcdHZhbHVlID0gKCR0aGlzLmlzKFwiOmNoZWNrZWRcIikgPyB2YWx1ZSA6IFwiXCIpO1xuXHRcdH1cblx0XHRpZiAodHlwZSA9PT0gXCJyYWRpb1wiKSB7XG5cdFx0XHR2YWx1ZSA9ICgkKCdpbnB1dFtuYW1lPVwiJyArICR0aGlzLmF0dHIoXCJuYW1lXCIpICsgJ1wiXTpjaGVja2VkJykubGVuZ3RoID4gMCA/IHZhbHVlIDogXCJcIik7XG5cdFx0fVxuXHRcdHJldHVybiB2YWx1ZTtcblx0fTtcblxuICBmdW5jdGlvbiByZWdleEZyb21TdHJpbmcoaW5wdXRzdHJpbmcpIHtcblx0XHRyZXR1cm4gbmV3IFJlZ0V4cChcIl5cIiArIGlucHV0c3RyaW5nICsgXCIkXCIpO1xuXHR9XG5cbiAgLyoqXG4gICAqIFRoYW5rcyB0byBKYXNvbiBCdW50aW5nIHZpYSBTdGFja092ZXJmbG93LmNvbVxuICAgKlxuICAgKiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM1OTc4OC9ob3ctdG8tZXhlY3V0ZS1hLWphdmFzY3JpcHQtZnVuY3Rpb24td2hlbi1pLWhhdmUtaXRzLW5hbWUtYXMtYS1zdHJpbmcjYW5zd2VyLTM1OTkxMFxuICAgKiBTaG9ydCBsaW5rOiBodHRwOi8vdGlueXVybC5jb20vZXhlY3V0ZUZ1bmN0aW9uQnlOYW1lXG4gICoqL1xuICBmdW5jdGlvbiBleGVjdXRlRnVuY3Rpb25CeU5hbWUoZnVuY3Rpb25OYW1lLCBjb250ZXh0IC8qLCBhcmdzKi8pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuc3BsaWNlKDIpO1xuICAgIHZhciBuYW1lc3BhY2VzID0gZnVuY3Rpb25OYW1lLnNwbGl0KFwiLlwiKTtcbiAgICB2YXIgZnVuYyA9IG5hbWVzcGFjZXMucG9wKCk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IG5hbWVzcGFjZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnRleHQgPSBjb250ZXh0W25hbWVzcGFjZXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dFtmdW5jXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG5cdCQuZm4uanFCb290c3RyYXBWYWxpZGF0aW9uID0gZnVuY3Rpb24oIG1ldGhvZCApIHtcblxuXHRcdGlmICggZGVmYXVsdHMubWV0aG9kc1ttZXRob2RdICkge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRzLm1ldGhvZHNbbWV0aG9kXS5hcHBseSggdGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApKTtcblx0XHR9IGVsc2UgaWYgKCB0eXBlb2YgbWV0aG9kID09PSAnb2JqZWN0JyB8fCAhIG1ldGhvZCApIHtcblx0XHRcdHJldHVybiBkZWZhdWx0cy5tZXRob2RzLmluaXQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0JC5lcnJvciggJ01ldGhvZCAnICsgIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24galF1ZXJ5LmpxQm9vdHN0cmFwVmFsaWRhdGlvbicgKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHR9O1xuXG4gICQuanFCb290c3RyYXBWYWxpZGF0aW9uID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAkKFwiOmlucHV0XCIpLm5vdChcIlt0eXBlPWltYWdlXSxbdHlwZT1zdWJtaXRdXCIpLmpxQm9vdHN0cmFwVmFsaWRhdGlvbi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7XG4gIH07XG5cbn0pKCBqUXVlcnkgKTtcbiIsIi8qKlxuICogSXNvdG9wZSB2MS41LjI1XG4gKiBBbiBleHF1aXNpdGUgalF1ZXJ5IHBsdWdpbiBmb3IgbWFnaWNhbCBsYXlvdXRzXG4gKiBodHRwOi8vaXNvdG9wZS5tZXRhZml6enkuY29cbiAqXG4gKiBDb21tZXJjaWFsIHVzZSByZXF1aXJlcyBvbmUtdGltZSBsaWNlbnNlIGZlZVxuICogaHR0cDovL21ldGFmaXp6eS5jby8jbGljZW5zZXNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMiBEYXZpZCBEZVNhbmRybyAvIE1ldGFmaXp6eVxuICovXG5cbi8qanNoaW50IGFzaTogdHJ1ZSwgYnJvd3NlcjogdHJ1ZSwgY3VybHk6IHRydWUsIGVxZXFlcTogdHJ1ZSwgZm9yaW46IGZhbHNlLCBpbW1lZDogZmFsc2UsIG5ld2NhcDogdHJ1ZSwgbm9lbXB0eTogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSAqL1xuLypnbG9iYWwgalF1ZXJ5OiBmYWxzZSAqL1xuXG4oZnVuY3Rpb24oIHdpbmRvdywgJCwgdW5kZWZpbmVkICl7XG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIGdldCBnbG9iYWwgdmFyc1xuICB2YXIgZG9jdW1lbnQgPSB3aW5kb3cuZG9jdW1lbnQ7XG4gIHZhciBNb2Rlcm5penIgPSB3aW5kb3cuTW9kZXJuaXpyO1xuXG4gIC8vIGhlbHBlciBmdW5jdGlvblxuICB2YXIgY2FwaXRhbGl6ZSA9IGZ1bmN0aW9uKCBzdHIgKSB7XG4gICAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbiAgfTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09IGdldFN0eWxlUHJvcGVydHkgYnkga2FuZ2F4ID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLy8gaHR0cDovL3BlcmZlY3Rpb25raWxscy5jb20vZmVhdHVyZS10ZXN0aW5nLWNzcy1wcm9wZXJ0aWVzL1xuXG4gIHZhciBwcmVmaXhlcyA9ICdNb3ogV2Via2l0IE8gTXMnLnNwbGl0KCcgJyk7XG5cbiAgdmFyIGdldFN0eWxlUHJvcGVydHkgPSBmdW5jdGlvbiggcHJvcE5hbWUgKSB7XG4gICAgdmFyIHN0eWxlID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLFxuICAgICAgICBwcmVmaXhlZDtcblxuICAgIC8vIHRlc3Qgc3RhbmRhcmQgcHJvcGVydHkgZmlyc3RcbiAgICBpZiAoIHR5cGVvZiBzdHlsZVtwcm9wTmFtZV0gPT09ICdzdHJpbmcnICkge1xuICAgICAgcmV0dXJuIHByb3BOYW1lO1xuICAgIH1cblxuICAgIC8vIGNhcGl0YWxpemVcbiAgICBwcm9wTmFtZSA9IGNhcGl0YWxpemUoIHByb3BOYW1lICk7XG5cbiAgICAvLyB0ZXN0IHZlbmRvciBzcGVjaWZpYyBwcm9wZXJ0aWVzXG4gICAgZm9yICggdmFyIGk9MCwgbGVuID0gcHJlZml4ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKysgKSB7XG4gICAgICBwcmVmaXhlZCA9IHByZWZpeGVzW2ldICsgcHJvcE5hbWU7XG4gICAgICBpZiAoIHR5cGVvZiBzdHlsZVsgcHJlZml4ZWQgXSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgIHJldHVybiBwcmVmaXhlZDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgdmFyIHRyYW5zZm9ybVByb3AgPSBnZXRTdHlsZVByb3BlcnR5KCd0cmFuc2Zvcm0nKSxcbiAgICAgIHRyYW5zaXRpb25Qcm9wID0gZ2V0U3R5bGVQcm9wZXJ0eSgndHJhbnNpdGlvblByb3BlcnR5Jyk7XG5cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09IG1pbmlNb2Rlcm5penIgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAvLyA8MzwzPDMgYW5kIHRoYW5rcyB0byBGYXJ1ayBhbmQgUGF1bCBmb3IgZG9pbmcgdGhlIGhlYXZ5IGxpZnRpbmdcblxuICAvKiFcbiAgICogTW9kZXJuaXpyIHYxLjZpc2g6IG1pbmlNb2Rlcm5penIgZm9yIElzb3RvcGVcbiAgICogaHR0cDovL3d3dy5tb2Rlcm5penIuY29tXG4gICAqXG4gICAqIERldmVsb3BlZCBieTpcbiAgICogLSBGYXJ1ayBBdGVzICBodHRwOi8vZmFydWthdC5lcy9cbiAgICogLSBQYXVsIElyaXNoICBodHRwOi8vcGF1bGlyaXNoLmNvbS9cbiAgICpcbiAgICogQ29weXJpZ2h0IChjKSAyMDA5LTIwMTBcbiAgICogRHVhbC1saWNlbnNlZCB1bmRlciB0aGUgQlNEIG9yIE1JVCBsaWNlbnNlcy5cbiAgICogaHR0cDovL3d3dy5tb2Rlcm5penIuY29tL2xpY2Vuc2UvXG4gICAqL1xuXG4gIC8qXG4gICAqIFRoaXMgdmVyc2lvbiB3aGl0dGxlcyBkb3duIHRoZSBzY3JpcHQganVzdCB0byBjaGVjayBzdXBwb3J0IGZvclxuICAgKiBDU1MgdHJhbnNpdGlvbnMsIHRyYW5zZm9ybXMsIGFuZCAzRCB0cmFuc2Zvcm1zLlxuICAqL1xuXG4gIHZhciB0ZXN0cyA9IHtcbiAgICBjc3N0cmFuc2Zvcm1zOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhIXRyYW5zZm9ybVByb3A7XG4gICAgfSxcblxuICAgIGNzc3RyYW5zZm9ybXMzZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdGVzdCA9ICEhZ2V0U3R5bGVQcm9wZXJ0eSgncGVyc3BlY3RpdmUnKTtcbiAgICAgIC8vIGRvdWJsZSBjaGVjayBmb3IgQ2hyb21lJ3MgZmFsc2UgcG9zaXRpdmVcbiAgICAgIGlmICggdGVzdCApIHtcbiAgICAgICAgdmFyIHZlbmRvckNTU1ByZWZpeGVzID0gJyAtby0gLW1vei0gLW1zLSAtd2Via2l0LSAta2h0bWwtICcuc3BsaXQoJyAnKSxcbiAgICAgICAgICAgIG1lZGlhUXVlcnkgPSAnQG1lZGlhICgnICsgdmVuZG9yQ1NTUHJlZml4ZXMuam9pbigndHJhbnNmb3JtLTNkKSwoJykgKyAnbW9kZXJuaXpyKScsXG4gICAgICAgICAgICAkc3R5bGUgPSAkKCc8c3R5bGU+JyArIG1lZGlhUXVlcnkgKyAneyNtb2Rlcm5penJ7aGVpZ2h0OjNweH19JyArICc8L3N0eWxlPicpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oJ2hlYWQnKSxcbiAgICAgICAgICAgICRkaXYgPSAkKCc8ZGl2IGlkPVwibW9kZXJuaXpyXCIgLz4nKS5hcHBlbmRUbygnaHRtbCcpO1xuXG4gICAgICAgIHRlc3QgPSAkZGl2LmhlaWdodCgpID09PSAzO1xuXG4gICAgICAgICRkaXYucmVtb3ZlKCk7XG4gICAgICAgICRzdHlsZS5yZW1vdmUoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0ZXN0O1xuICAgIH0sXG5cbiAgICBjc3N0cmFuc2l0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gISF0cmFuc2l0aW9uUHJvcDtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHRlc3ROYW1lO1xuXG4gIGlmICggTW9kZXJuaXpyICkge1xuICAgIC8vIGlmIHRoZXJlJ3MgYSBwcmV2aW91cyBNb2Rlcm56aXIsIGNoZWNrIGlmIHRoZXJlIGFyZSBuZWNlc3NhcnkgdGVzdHNcbiAgICBmb3IgKCB0ZXN0TmFtZSBpbiB0ZXN0cykge1xuICAgICAgaWYgKCAhTW9kZXJuaXpyLmhhc093blByb3BlcnR5KCB0ZXN0TmFtZSApICkge1xuICAgICAgICAvLyBpZiB0ZXN0IGhhc24ndCBiZWVuIHJ1biwgdXNlIGFkZFRlc3QgdG8gcnVuIGl0XG4gICAgICAgIE1vZGVybml6ci5hZGRUZXN0KCB0ZXN0TmFtZSwgdGVzdHNbIHRlc3ROYW1lIF0gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gb3IgY3JlYXRlIG5ldyBtaW5pIE1vZGVybml6ciB0aGF0IGp1c3QgaGFzIHRoZSAzIHRlc3RzXG4gICAgTW9kZXJuaXpyID0gd2luZG93Lk1vZGVybml6ciA9IHtcbiAgICAgIF92ZXJzaW9uIDogJzEuNmlzaDogbWluaU1vZGVybml6ciBmb3IgSXNvdG9wZSdcbiAgICB9O1xuXG4gICAgdmFyIGNsYXNzZXMgPSAnICc7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIC8vIFJ1biB0aHJvdWdoIHRlc3RzXG4gICAgZm9yICggdGVzdE5hbWUgaW4gdGVzdHMpIHtcbiAgICAgIHJlc3VsdCA9IHRlc3RzWyB0ZXN0TmFtZSBdKCk7XG4gICAgICBNb2Rlcm5penJbIHRlc3ROYW1lIF0gPSByZXN1bHQ7XG4gICAgICBjbGFzc2VzICs9ICcgJyArICggcmVzdWx0ID8gICcnIDogJ25vLScgKSArIHRlc3ROYW1lO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgbmV3IGNsYXNzZXMgdG8gdGhlIDxodG1sPiBlbGVtZW50LlxuICAgICQoJ2h0bWwnKS5hZGRDbGFzcyggY2xhc3NlcyApO1xuICB9XG5cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09IGlzb1RyYW5zZm9ybSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgLyoqXG4gICAqICBwcm92aWRlcyBob29rcyBmb3IgLmNzcyh7IHNjYWxlOiB2YWx1ZSwgdHJhbnNsYXRlOiBbeCwgeV0gfSlcbiAgICogIFByb2dyZXNzaXZlbHkgZW5oYW5jZWQgQ1NTIHRyYW5zZm9ybXNcbiAgICogIFVzZXMgaGFyZHdhcmUgYWNjZWxlcmF0ZWQgM0QgdHJhbnNmb3JtcyBmb3IgU2FmYXJpXG4gICAqICBvciBmYWxscyBiYWNrIHRvIDJEIHRyYW5zZm9ybXMuXG4gICAqL1xuXG4gIGlmICggTW9kZXJuaXpyLmNzc3RyYW5zZm9ybXMgKSB7XG5cbiAgICAgICAgLy8gaS5lLiB0cmFuc2Zvcm1Gbk5vdGF0aW9ucy5zY2FsZSgwLjUpID4+ICdzY2FsZTNkKCAwLjUsIDAuNSwgMSknXG4gICAgdmFyIHRyYW5zZm9ybUZuTm90YXRpb25zID0gTW9kZXJuaXpyLmNzc3RyYW5zZm9ybXMzZCA/XG4gICAgICB7IC8vIDNEIHRyYW5zZm9ybSBmdW5jdGlvbnNcbiAgICAgICAgdHJhbnNsYXRlIDogZnVuY3Rpb24gKCBwb3NpdGlvbiApIHtcbiAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZTNkKCcgKyBwb3NpdGlvblswXSArICdweCwgJyArIHBvc2l0aW9uWzFdICsgJ3B4LCAwKSAnO1xuICAgICAgICB9LFxuICAgICAgICBzY2FsZSA6IGZ1bmN0aW9uICggc2NhbGUgKSB7XG4gICAgICAgICAgcmV0dXJuICdzY2FsZTNkKCcgKyBzY2FsZSArICcsICcgKyBzY2FsZSArICcsIDEpICc7XG4gICAgICAgIH1cbiAgICAgIH0gOlxuICAgICAgeyAvLyAyRCB0cmFuc2Zvcm0gZnVuY3Rpb25zXG4gICAgICAgIHRyYW5zbGF0ZSA6IGZ1bmN0aW9uICggcG9zaXRpb24gKSB7XG4gICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIHBvc2l0aW9uWzBdICsgJ3B4LCAnICsgcG9zaXRpb25bMV0gKyAncHgpICc7XG4gICAgICAgIH0sXG4gICAgICAgIHNjYWxlIDogZnVuY3Rpb24gKCBzY2FsZSApIHtcbiAgICAgICAgICByZXR1cm4gJ3NjYWxlKCcgKyBzY2FsZSArICcpICc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICA7XG5cbiAgICB2YXIgc2V0SXNvVHJhbnNmb3JtID0gZnVuY3Rpb24gKCBlbGVtLCBuYW1lLCB2YWx1ZSApIHtcbiAgICAgICAgICAvLyB1bnBhY2sgY3VycmVudCB0cmFuc2Zvcm0gZGF0YVxuICAgICAgdmFyIGRhdGEgPSAgJC5kYXRhKCBlbGVtLCAnaXNvVHJhbnNmb3JtJyApIHx8IHt9LFxuICAgICAgICAgIG5ld0RhdGEgPSB7fSxcbiAgICAgICAgICBmbk5hbWUsXG4gICAgICAgICAgdHJhbnNmb3JtT2JqID0ge30sXG4gICAgICAgICAgdHJhbnNmb3JtVmFsdWU7XG5cbiAgICAgIC8vIGkuZS4gbmV3RGF0YS5zY2FsZSA9IDAuNVxuICAgICAgbmV3RGF0YVsgbmFtZSBdID0gdmFsdWU7XG4gICAgICAvLyBleHRlbmQgbmV3IHZhbHVlIG92ZXIgY3VycmVudCBkYXRhXG4gICAgICAkLmV4dGVuZCggZGF0YSwgbmV3RGF0YSApO1xuXG4gICAgICBmb3IgKCBmbk5hbWUgaW4gZGF0YSApIHtcbiAgICAgICAgdHJhbnNmb3JtVmFsdWUgPSBkYXRhWyBmbk5hbWUgXTtcbiAgICAgICAgdHJhbnNmb3JtT2JqWyBmbk5hbWUgXSA9IHRyYW5zZm9ybUZuTm90YXRpb25zWyBmbk5hbWUgXSggdHJhbnNmb3JtVmFsdWUgKTtcbiAgICAgIH1cblxuICAgICAgLy8gZ2V0IHByb3BlciBvcmRlclxuICAgICAgLy8gaWRlYWxseSwgd2UgY291bGQgbG9vcCB0aHJvdWdoIHRoaXMgZ2l2ZSBhbiBhcnJheSwgYnV0IHNpbmNlIHdlIG9ubHkgaGF2ZVxuICAgICAgLy8gYSBjb3VwbGUgdHJhbnNmb3JtcyB3ZSdyZSBrZWVwaW5nIHRyYWNrIG9mLCB3ZSdsbCBkbyBpdCBsaWtlIHNvXG4gICAgICB2YXIgdHJhbnNsYXRlRm4gPSB0cmFuc2Zvcm1PYmoudHJhbnNsYXRlIHx8ICcnLFxuICAgICAgICAgIHNjYWxlRm4gPSB0cmFuc2Zvcm1PYmouc2NhbGUgfHwgJycsXG4gICAgICAgICAgLy8gc29ydGluZyBzbyB0cmFuc2xhdGUgYWx3YXlzIGNvbWVzIGZpcnN0XG4gICAgICAgICAgdmFsdWVGbnMgPSB0cmFuc2xhdGVGbiArIHNjYWxlRm47XG5cbiAgICAgIC8vIHNldCBkYXRhIGJhY2sgaW4gZWxlbVxuICAgICAgJC5kYXRhKCBlbGVtLCAnaXNvVHJhbnNmb3JtJywgZGF0YSApO1xuXG4gICAgICAvLyBzZXQgbmFtZSB0byB2ZW5kb3Igc3BlY2lmaWMgcHJvcGVydHlcbiAgICAgIGVsZW0uc3R5bGVbIHRyYW5zZm9ybVByb3AgXSA9IHZhbHVlRm5zO1xuICAgIH07XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBzY2FsZSA9PT09PT09PT09PT09PT09PT09XG5cbiAgICAkLmNzc051bWJlci5zY2FsZSA9IHRydWU7XG5cbiAgICAkLmNzc0hvb2tzLnNjYWxlID0ge1xuICAgICAgc2V0OiBmdW5jdGlvbiggZWxlbSwgdmFsdWUgKSB7XG4gICAgICAgIC8vIHVuY29tbWVudCB0aGlzIGJpdCBpZiB5b3Ugd2FudCB0byBwcm9wZXJseSBwYXJzZSBzdHJpbmdzXG4gICAgICAgIC8vIGlmICggdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyApIHtcbiAgICAgICAgLy8gICB2YWx1ZSA9IHBhcnNlRmxvYXQoIHZhbHVlICk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgc2V0SXNvVHJhbnNmb3JtKCBlbGVtLCAnc2NhbGUnLCB2YWx1ZSApO1xuICAgICAgfSxcbiAgICAgIGdldDogZnVuY3Rpb24oIGVsZW0sIGNvbXB1dGVkICkge1xuICAgICAgICB2YXIgdHJhbnNmb3JtID0gJC5kYXRhKCBlbGVtLCAnaXNvVHJhbnNmb3JtJyApO1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtICYmIHRyYW5zZm9ybS5zY2FsZSA/IHRyYW5zZm9ybS5zY2FsZSA6IDE7XG4gICAgICB9XG4gICAgfTtcblxuICAgICQuZnguc3RlcC5zY2FsZSA9IGZ1bmN0aW9uKCBmeCApIHtcbiAgICAgICQuY3NzSG9va3Muc2NhbGUuc2V0KCBmeC5lbGVtLCBmeC5ub3crZngudW5pdCApO1xuICAgIH07XG5cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IHRyYW5zbGF0ZSA9PT09PT09PT09PT09PT09PT09XG5cbiAgICAkLmNzc051bWJlci50cmFuc2xhdGUgPSB0cnVlO1xuXG4gICAgJC5jc3NIb29rcy50cmFuc2xhdGUgPSB7XG4gICAgICBzZXQ6IGZ1bmN0aW9uKCBlbGVtLCB2YWx1ZSApIHtcblxuICAgICAgICAvLyB1bmNvbW1lbnQgdGhpcyBiaXQgaWYgeW91IHdhbnQgdG8gcHJvcGVybHkgcGFyc2Ugc3RyaW5nc1xuICAgICAgICAvLyBpZiAoIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgIC8vICAgdmFsdWUgPSB2YWx1ZS5zcGxpdCgnICcpO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHZhciBpLCB2YWw7XG4gICAgICAgIC8vIGZvciAoIGkgPSAwOyBpIDwgMjsgaSsrICkge1xuICAgICAgICAvLyAgIHZhbCA9IHZhbHVlW2ldO1xuICAgICAgICAvLyAgIGlmICggdHlwZW9mIHZhbCA9PT0gJ3N0cmluZycgKSB7XG4gICAgICAgIC8vICAgICB2YWwgPSBwYXJzZUludCggdmFsICk7XG4gICAgICAgIC8vICAgfVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgc2V0SXNvVHJhbnNmb3JtKCBlbGVtLCAndHJhbnNsYXRlJywgdmFsdWUgKTtcbiAgICAgIH0sXG5cbiAgICAgIGdldDogZnVuY3Rpb24oIGVsZW0sIGNvbXB1dGVkICkge1xuICAgICAgICB2YXIgdHJhbnNmb3JtID0gJC5kYXRhKCBlbGVtLCAnaXNvVHJhbnNmb3JtJyApO1xuICAgICAgICByZXR1cm4gdHJhbnNmb3JtICYmIHRyYW5zZm9ybS50cmFuc2xhdGUgPyB0cmFuc2Zvcm0udHJhbnNsYXRlIDogWyAwLCAwIF07XG4gICAgICB9XG4gICAgfTtcblxuICB9XG5cbiAgLy8gPT09PT09PT09PT09PT09PT09PT09PT09PSBnZXQgdHJhbnNpdGlvbi1lbmQgZXZlbnQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICB2YXIgdHJhbnNpdGlvbkVuZEV2ZW50LCB0cmFuc2l0aW9uRHVyUHJvcDtcblxuICBpZiAoIE1vZGVybml6ci5jc3N0cmFuc2l0aW9ucyApIHtcbiAgICB0cmFuc2l0aW9uRW5kRXZlbnQgPSB7XG4gICAgICBXZWJraXRUcmFuc2l0aW9uUHJvcGVydHk6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJywgIC8vIHdlYmtpdFxuICAgICAgTW96VHJhbnNpdGlvblByb3BlcnR5OiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICBPVHJhbnNpdGlvblByb3BlcnR5OiAnb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnLFxuICAgICAgdHJhbnNpdGlvblByb3BlcnR5OiAndHJhbnNpdGlvbmVuZCdcbiAgICB9WyB0cmFuc2l0aW9uUHJvcCBdO1xuXG4gICAgdHJhbnNpdGlvbkR1clByb3AgPSBnZXRTdHlsZVByb3BlcnR5KCd0cmFuc2l0aW9uRHVyYXRpb24nKTtcbiAgfVxuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09PT0gc21hcnRyZXNpemUgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gIC8qXG4gICAqIHNtYXJ0cmVzaXplOiBkZWJvdW5jZWQgcmVzaXplIGV2ZW50IGZvciBqUXVlcnlcbiAgICpcbiAgICogbGF0ZXN0IHZlcnNpb24gYW5kIGNvbXBsZXRlIFJFQURNRSBhdmFpbGFibGUgb24gR2l0aHViOlxuICAgKiBodHRwczovL2dpdGh1Yi5jb20vbG91aXNyZW1pL2pxdWVyeS5zbWFydHJlc2l6ZS5qc1xuICAgKlxuICAgKiBDb3B5cmlnaHQgMjAxMSBAbG91aXNfcmVtaVxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gICAqL1xuXG4gIHZhciAkZXZlbnQgPSAkLmV2ZW50LFxuICAgICAgZGlzcGF0Y2hNZXRob2QgPSAkLmV2ZW50LmhhbmRsZSA/ICdoYW5kbGUnIDogJ2Rpc3BhdGNoJyxcbiAgICAgIHJlc2l6ZVRpbWVvdXQ7XG5cbiAgJGV2ZW50LnNwZWNpYWwuc21hcnRyZXNpemUgPSB7XG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS5iaW5kKCBcInJlc2l6ZVwiLCAkZXZlbnQuc3BlY2lhbC5zbWFydHJlc2l6ZS5oYW5kbGVyICk7XG4gICAgfSxcbiAgICB0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnVuYmluZCggXCJyZXNpemVcIiwgJGV2ZW50LnNwZWNpYWwuc21hcnRyZXNpemUuaGFuZGxlciApO1xuICAgIH0sXG4gICAgaGFuZGxlcjogZnVuY3Rpb24oIGV2ZW50LCBleGVjQXNhcCApIHtcbiAgICAgIC8vIFNhdmUgdGhlIGNvbnRleHRcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcyxcbiAgICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAvLyBzZXQgY29ycmVjdCBldmVudCB0eXBlXG4gICAgICBldmVudC50eXBlID0gXCJzbWFydHJlc2l6ZVwiO1xuXG4gICAgICBpZiAoIHJlc2l6ZVRpbWVvdXQgKSB7IGNsZWFyVGltZW91dCggcmVzaXplVGltZW91dCApOyB9XG4gICAgICByZXNpemVUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJGV2ZW50WyBkaXNwYXRjaE1ldGhvZCBdLmFwcGx5KCBjb250ZXh0LCBhcmdzICk7XG4gICAgICB9LCBleGVjQXNhcCA9PT0gXCJleGVjQXNhcFwiPyAwIDogMTAwICk7XG4gICAgfVxuICB9O1xuXG4gICQuZm4uc21hcnRyZXNpemUgPSBmdW5jdGlvbiggZm4gKSB7XG4gICAgcmV0dXJuIGZuID8gdGhpcy5iaW5kKCBcInNtYXJ0cmVzaXplXCIsIGZuICkgOiB0aGlzLnRyaWdnZXIoIFwic21hcnRyZXNpemVcIiwgW1wiZXhlY0FzYXBcIl0gKTtcbiAgfTtcblxuXG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT0gSXNvdG9wZSA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cblxuICAvLyBvdXIgXCJXaWRnZXRcIiBvYmplY3QgY29uc3RydWN0b3JcbiAgJC5Jc290b3BlID0gZnVuY3Rpb24oIG9wdGlvbnMsIGVsZW1lbnQsIGNhbGxiYWNrICl7XG4gICAgdGhpcy5lbGVtZW50ID0gJCggZWxlbWVudCApO1xuXG4gICAgdGhpcy5fY3JlYXRlKCBvcHRpb25zICk7XG4gICAgdGhpcy5faW5pdCggY2FsbGJhY2sgKTtcbiAgfTtcblxuICAvLyBzdHlsZXMgb2YgY29udGFpbmVyIGVsZW1lbnQgd2Ugd2FudCB0byBrZWVwIHRyYWNrIG9mXG4gIHZhciBpc29Db250YWluZXJTdHlsZXMgPSBbICd3aWR0aCcsICdoZWlnaHQnIF07XG5cbiAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cbiAgJC5Jc290b3BlLnNldHRpbmdzID0ge1xuICAgIHJlc2l6YWJsZTogdHJ1ZSxcbiAgICBsYXlvdXRNb2RlIDogJ21hc29ucnknLFxuICAgIGNvbnRhaW5lckNsYXNzIDogJ2lzb3RvcGUnLFxuICAgIGl0ZW1DbGFzcyA6ICdpc290b3BlLWl0ZW0nLFxuICAgIGhpZGRlbkNsYXNzIDogJ2lzb3RvcGUtaGlkZGVuJyxcbiAgICBoaWRkZW5TdHlsZTogeyBvcGFjaXR5OiAwLCBzY2FsZTogMC4wMDEgfSxcbiAgICB2aXNpYmxlU3R5bGU6IHsgb3BhY2l0eTogMSwgc2NhbGU6IDEgfSxcbiAgICBjb250YWluZXJTdHlsZToge1xuICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXG4gICAgICBvdmVyZmxvdzogJ2hpZGRlbidcbiAgICB9LFxuICAgIGFuaW1hdGlvbkVuZ2luZTogJ2Jlc3QtYXZhaWxhYmxlJyxcbiAgICBhbmltYXRpb25PcHRpb25zOiB7XG4gICAgICBxdWV1ZTogZmFsc2UsXG4gICAgICBkdXJhdGlvbjogODAwXG4gICAgfSxcbiAgICBzb3J0QnkgOiAnb3JpZ2luYWwtb3JkZXInLFxuICAgIHNvcnRBc2NlbmRpbmcgOiB0cnVlLFxuICAgIHJlc2l6ZXNDb250YWluZXIgOiB0cnVlLFxuICAgIHRyYW5zZm9ybXNFbmFibGVkOiB0cnVlLFxuICAgIGl0ZW1Qb3NpdGlvbkRhdGFFbmFibGVkOiBmYWxzZVxuICB9O1xuXG4gICQuSXNvdG9wZS5wcm90b3R5cGUgPSB7XG5cbiAgICAvLyBzZXRzIHVwIHdpZGdldFxuICAgIF9jcmVhdGUgOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblxuICAgICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoIHt9LCAkLklzb3RvcGUuc2V0dGluZ3MsIG9wdGlvbnMgKTtcblxuICAgICAgdGhpcy5zdHlsZVF1ZXVlID0gW107XG4gICAgICB0aGlzLmVsZW1Db3VudCA9IDA7XG5cbiAgICAgIC8vIGdldCBvcmlnaW5hbCBzdHlsZXMgaW4gY2FzZSB3ZSByZS1hcHBseSB0aGVtIGluIC5kZXN0cm95KClcbiAgICAgIHZhciBlbGVtU3R5bGUgPSB0aGlzLmVsZW1lbnRbMF0uc3R5bGU7XG4gICAgICB0aGlzLm9yaWdpbmFsU3R5bGUgPSB7fTtcbiAgICAgIC8vIGtlZXAgdHJhY2sgb2YgY29udGFpbmVyIHN0eWxlc1xuICAgICAgdmFyIGNvbnRhaW5lclN0eWxlcyA9IGlzb0NvbnRhaW5lclN0eWxlcy5zbGljZSgwKTtcbiAgICAgIGZvciAoIHZhciBwcm9wIGluIHRoaXMub3B0aW9ucy5jb250YWluZXJTdHlsZSApIHtcbiAgICAgICAgY29udGFpbmVyU3R5bGVzLnB1c2goIHByb3AgKTtcbiAgICAgIH1cbiAgICAgIGZvciAoIHZhciBpPTAsIGxlbiA9IGNvbnRhaW5lclN0eWxlcy5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcbiAgICAgICAgcHJvcCA9IGNvbnRhaW5lclN0eWxlc1tpXTtcbiAgICAgICAgdGhpcy5vcmlnaW5hbFN0eWxlWyBwcm9wIF0gPSBlbGVtU3R5bGVbIHByb3AgXSB8fCAnJztcbiAgICAgIH1cbiAgICAgIC8vIGFwcGx5IGNvbnRhaW5lciBzdHlsZSBmcm9tIG9wdGlvbnNcbiAgICAgIHRoaXMuZWxlbWVudC5jc3MoIHRoaXMub3B0aW9ucy5jb250YWluZXJTdHlsZSApO1xuXG4gICAgICB0aGlzLl91cGRhdGVBbmltYXRpb25FbmdpbmUoKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVVzaW5nVHJhbnNmb3JtcygpO1xuXG4gICAgICAvLyBzb3J0aW5nXG4gICAgICB2YXIgb3JpZ2luYWxPcmRlclNvcnRlciA9IHtcbiAgICAgICAgJ29yaWdpbmFsLW9yZGVyJyA6IGZ1bmN0aW9uKCAkZWxlbSwgaW5zdGFuY2UgKSB7XG4gICAgICAgICAgaW5zdGFuY2UuZWxlbUNvdW50ICsrO1xuICAgICAgICAgIHJldHVybiBpbnN0YW5jZS5lbGVtQ291bnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHJhbmRvbSA6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLm9wdGlvbnMuZ2V0U29ydERhdGEgPSAkLmV4dGVuZCggdGhpcy5vcHRpb25zLmdldFNvcnREYXRhLCBvcmlnaW5hbE9yZGVyU29ydGVyICk7XG5cbiAgICAgIC8vIG5lZWQgdG8gZ2V0IGF0b21zXG4gICAgICB0aGlzLnJlbG9hZEl0ZW1zKCk7XG5cbiAgICAgIC8vIGdldCB0b3AgbGVmdCBwb3NpdGlvbiBvZiB3aGVyZSB0aGUgYnJpY2tzIHNob3VsZCBiZVxuICAgICAgdGhpcy5vZmZzZXQgPSB7XG4gICAgICAgIGxlZnQ6IHBhcnNlSW50KCAoIHRoaXMuZWxlbWVudC5jc3MoJ3BhZGRpbmctbGVmdCcpIHx8IDAgKSwgMTAgKSxcbiAgICAgICAgdG9wOiBwYXJzZUludCggKCB0aGlzLmVsZW1lbnQuY3NzKCdwYWRkaW5nLXRvcCcpIHx8IDAgKSwgMTAgKVxuICAgICAgfTtcblxuICAgICAgLy8gYWRkIGlzb3RvcGUgY2xhc3MgZmlyc3QgdGltZSBhcm91bmRcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgaW5zdGFuY2UuZWxlbWVudC5hZGRDbGFzcyggaW5zdGFuY2Uub3B0aW9ucy5jb250YWluZXJDbGFzcyApO1xuICAgICAgfSwgMCApO1xuXG4gICAgICAvLyBiaW5kIHJlc2l6ZSBtZXRob2RcbiAgICAgIGlmICggdGhpcy5vcHRpb25zLnJlc2l6YWJsZSApIHtcbiAgICAgICAgJHdpbmRvdy5iaW5kKCAnc21hcnRyZXNpemUuaXNvdG9wZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGluc3RhbmNlLnJlc2l6ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gZGlzbWlzcyBhbGwgY2xpY2sgZXZlbnRzIGZyb20gaGlkZGVuIGV2ZW50c1xuICAgICAgdGhpcy5lbGVtZW50LmRlbGVnYXRlKCAnLicgKyB0aGlzLm9wdGlvbnMuaGlkZGVuQ2xhc3MsICdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0pO1xuXG4gICAgfSxcblxuICAgIF9nZXRBdG9tcyA6IGZ1bmN0aW9uKCAkZWxlbXMgKSB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuaXRlbVNlbGVjdG9yLFxuICAgICAgICAgIC8vIGZpbHRlciAmIGZpbmRcbiAgICAgICAgICAkYXRvbXMgPSBzZWxlY3RvciA/ICRlbGVtcy5maWx0ZXIoIHNlbGVjdG9yICkuYWRkKCAkZWxlbXMuZmluZCggc2VsZWN0b3IgKSApIDogJGVsZW1zLFxuICAgICAgICAgIC8vIGJhc2Ugc3R5bGUgZm9yIGF0b21zXG4gICAgICAgICAgYXRvbVN0eWxlID0geyBwb3NpdGlvbjogJ2Fic29sdXRlJyB9O1xuXG4gICAgICAvLyBmaWx0ZXIgb3V0IHRleHQgbm9kZXNcbiAgICAgICRhdG9tcyA9ICRhdG9tcy5maWx0ZXIoIGZ1bmN0aW9uKCBpLCBhdG9tICkge1xuICAgICAgICByZXR1cm4gYXRvbS5ub2RlVHlwZSA9PT0gMTtcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoIHRoaXMudXNpbmdUcmFuc2Zvcm1zICkge1xuICAgICAgICBhdG9tU3R5bGUubGVmdCA9IDA7XG4gICAgICAgIGF0b21TdHlsZS50b3AgPSAwO1xuICAgICAgfVxuXG4gICAgICAkYXRvbXMuY3NzKCBhdG9tU3R5bGUgKS5hZGRDbGFzcyggdGhpcy5vcHRpb25zLml0ZW1DbGFzcyApO1xuXG4gICAgICB0aGlzLnVwZGF0ZVNvcnREYXRhKCAkYXRvbXMsIHRydWUgKTtcblxuICAgICAgcmV0dXJuICRhdG9tcztcbiAgICB9LFxuXG4gICAgLy8gX2luaXQgZmlyZXMgd2hlbiB5b3VyIGluc3RhbmNlIGlzIGZpcnN0IGNyZWF0ZWRcbiAgICAvLyAoZnJvbSB0aGUgY29uc3RydWN0b3IgYWJvdmUpLCBhbmQgd2hlbiB5b3VcbiAgICAvLyBhdHRlbXB0IHRvIGluaXRpYWxpemUgdGhlIHdpZGdldCBhZ2FpbiAoYnkgdGhlIGJyaWRnZSlcbiAgICAvLyBhZnRlciBpdCBoYXMgYWxyZWFkeSBiZWVuIGluaXRpYWxpemVkLlxuICAgIF9pbml0IDogZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuXG4gICAgICB0aGlzLiRmaWx0ZXJlZEF0b21zID0gdGhpcy5fZmlsdGVyKCB0aGlzLiRhbGxBdG9tcyApO1xuICAgICAgdGhpcy5fc29ydCgpO1xuICAgICAgdGhpcy5yZUxheW91dCggY2FsbGJhY2sgKTtcblxuICAgIH0sXG5cbiAgICBvcHRpb24gOiBmdW5jdGlvbiggb3B0cyApe1xuICAgICAgLy8gY2hhbmdlIG9wdGlvbnMgQUZURVIgaW5pdGlhbGl6YXRpb246XG4gICAgICAvLyBzaWduYXR1cmU6ICQoJyNmb28nKS5iYXIoeyBjb29sOmZhbHNlIH0pO1xuICAgICAgaWYgKCAkLmlzUGxhaW5PYmplY3QoIG9wdHMgKSApe1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCggdHJ1ZSwgdGhpcy5vcHRpb25zLCBvcHRzICk7XG5cbiAgICAgICAgLy8gdHJpZ2dlciBfdXBkYXRlT3B0aW9uTmFtZSBpZiBpdCBleGlzdHNcbiAgICAgICAgdmFyIHVwZGF0ZU9wdGlvbkZuO1xuICAgICAgICBmb3IgKCB2YXIgb3B0aW9uTmFtZSBpbiBvcHRzICkge1xuICAgICAgICAgIHVwZGF0ZU9wdGlvbkZuID0gJ191cGRhdGUnICsgY2FwaXRhbGl6ZSggb3B0aW9uTmFtZSApO1xuICAgICAgICAgIGlmICggdGhpc1sgdXBkYXRlT3B0aW9uRm4gXSApIHtcbiAgICAgICAgICAgIHRoaXNbIHVwZGF0ZU9wdGlvbkZuIF0oKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSB1cGRhdGVycyA9PT09PT09PT09PT09PT09PT09PT09IC8vXG4gICAgLy8ga2luZCBvZiBsaWtlIHNldHRlcnNcblxuICAgIF91cGRhdGVBbmltYXRpb25FbmdpbmUgOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhbmltYXRpb25FbmdpbmUgPSB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uRW5naW5lLnRvTG93ZXJDYXNlKCkucmVwbGFjZSggL1sgX1xcLV0vZywgJycpO1xuICAgICAgdmFyIGlzVXNpbmdKUXVlcnlBbmltYXRpb247XG4gICAgICAvLyBzZXQgYXBwbHlTdHlsZUZuTmFtZVxuICAgICAgc3dpdGNoICggYW5pbWF0aW9uRW5naW5lICkge1xuICAgICAgICBjYXNlICdjc3MnIDpcbiAgICAgICAgY2FzZSAnbm9uZScgOlxuICAgICAgICAgIGlzVXNpbmdKUXVlcnlBbmltYXRpb24gPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnanF1ZXJ5JyA6XG4gICAgICAgICAgaXNVc2luZ0pRdWVyeUFuaW1hdGlvbiA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQgOiAvLyBiZXN0IGF2YWlsYWJsZVxuICAgICAgICAgIGlzVXNpbmdKUXVlcnlBbmltYXRpb24gPSAhTW9kZXJuaXpyLmNzc3RyYW5zaXRpb25zO1xuICAgICAgfVxuICAgICAgdGhpcy5pc1VzaW5nSlF1ZXJ5QW5pbWF0aW9uID0gaXNVc2luZ0pRdWVyeUFuaW1hdGlvbjtcbiAgICAgIHRoaXMuX3VwZGF0ZVVzaW5nVHJhbnNmb3JtcygpO1xuICAgIH0sXG5cbiAgICBfdXBkYXRlVHJhbnNmb3Jtc0VuYWJsZWQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVVzaW5nVHJhbnNmb3JtcygpO1xuICAgIH0sXG5cbiAgICBfdXBkYXRlVXNpbmdUcmFuc2Zvcm1zIDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdXNpbmdUcmFuc2Zvcm1zID0gdGhpcy51c2luZ1RyYW5zZm9ybXMgPSB0aGlzLm9wdGlvbnMudHJhbnNmb3Jtc0VuYWJsZWQgJiZcbiAgICAgICAgTW9kZXJuaXpyLmNzc3RyYW5zZm9ybXMgJiYgTW9kZXJuaXpyLmNzc3RyYW5zaXRpb25zICYmICF0aGlzLmlzVXNpbmdKUXVlcnlBbmltYXRpb247XG5cbiAgICAgIC8vIHByZXZlbnQgc2NhbGVzIHdoZW4gdHJhbnNmb3JtcyBhcmUgZGlzYWJsZWRcbiAgICAgIGlmICggIXVzaW5nVHJhbnNmb3JtcyApIHtcbiAgICAgICAgZGVsZXRlIHRoaXMub3B0aW9ucy5oaWRkZW5TdHlsZS5zY2FsZTtcbiAgICAgICAgZGVsZXRlIHRoaXMub3B0aW9ucy52aXNpYmxlU3R5bGUuc2NhbGU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZ2V0UG9zaXRpb25TdHlsZXMgPSB1c2luZ1RyYW5zZm9ybXMgPyB0aGlzLl90cmFuc2xhdGUgOiB0aGlzLl9wb3NpdGlvbkFicztcbiAgICB9LFxuXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09IEZpbHRlcmluZyA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfZmlsdGVyIDogZnVuY3Rpb24oICRhdG9tcyApIHtcbiAgICAgIHZhciBmaWx0ZXIgPSB0aGlzLm9wdGlvbnMuZmlsdGVyID09PSAnJyA/ICcqJyA6IHRoaXMub3B0aW9ucy5maWx0ZXI7XG5cbiAgICAgIGlmICggIWZpbHRlciApIHtcbiAgICAgICAgcmV0dXJuICRhdG9tcztcbiAgICAgIH1cblxuICAgICAgdmFyIGhpZGRlbkNsYXNzICAgID0gdGhpcy5vcHRpb25zLmhpZGRlbkNsYXNzLFxuICAgICAgICAgIGhpZGRlblNlbGVjdG9yID0gJy4nICsgaGlkZGVuQ2xhc3MsXG4gICAgICAgICAgJGhpZGRlbkF0b21zICAgPSAkYXRvbXMuZmlsdGVyKCBoaWRkZW5TZWxlY3RvciApLFxuICAgICAgICAgICRhdG9tc1RvU2hvdyAgID0gJGhpZGRlbkF0b21zO1xuXG4gICAgICBpZiAoIGZpbHRlciAhPT0gJyonICkge1xuICAgICAgICAkYXRvbXNUb1Nob3cgPSAkaGlkZGVuQXRvbXMuZmlsdGVyKCBmaWx0ZXIgKTtcbiAgICAgICAgdmFyICRhdG9tc1RvSGlkZSA9ICRhdG9tcy5ub3QoIGhpZGRlblNlbGVjdG9yICkubm90KCBmaWx0ZXIgKS5hZGRDbGFzcyggaGlkZGVuQ2xhc3MgKTtcbiAgICAgICAgdGhpcy5zdHlsZVF1ZXVlLnB1c2goeyAkZWw6ICRhdG9tc1RvSGlkZSwgc3R5bGU6IHRoaXMub3B0aW9ucy5oaWRkZW5TdHlsZSB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdHlsZVF1ZXVlLnB1c2goeyAkZWw6ICRhdG9tc1RvU2hvdywgc3R5bGU6IHRoaXMub3B0aW9ucy52aXNpYmxlU3R5bGUgfSk7XG4gICAgICAkYXRvbXNUb1Nob3cucmVtb3ZlQ2xhc3MoIGhpZGRlbkNsYXNzICk7XG5cbiAgICAgIHJldHVybiAkYXRvbXMuZmlsdGVyKCBmaWx0ZXIgKTtcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBTb3J0aW5nID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIHVwZGF0ZVNvcnREYXRhIDogZnVuY3Rpb24oICRhdG9tcywgaXNJbmNyZW1lbnRpbmdFbGVtQ291bnQgKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzLFxuICAgICAgICAgIGdldFNvcnREYXRhID0gdGhpcy5vcHRpb25zLmdldFNvcnREYXRhLFxuICAgICAgICAgICR0aGlzLCBzb3J0RGF0YTtcbiAgICAgICRhdG9tcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgc29ydERhdGEgPSB7fTtcbiAgICAgICAgLy8gZ2V0IHZhbHVlIGZvciBzb3J0IGRhdGEgYmFzZWQgb24gZm4oICRlbGVtICkgcGFzc2VkIGluXG4gICAgICAgIGZvciAoIHZhciBrZXkgaW4gZ2V0U29ydERhdGEgKSB7XG4gICAgICAgICAgaWYgKCAhaXNJbmNyZW1lbnRpbmdFbGVtQ291bnQgJiYga2V5ID09PSAnb3JpZ2luYWwtb3JkZXInICkge1xuICAgICAgICAgICAgLy8ga2VlcCBvcmlnaW5hbCBvcmRlciBvcmlnaW5hbFxuICAgICAgICAgICAgc29ydERhdGFbIGtleSBdID0gJC5kYXRhKCB0aGlzLCAnaXNvdG9wZS1zb3J0LWRhdGEnIClbIGtleSBdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzb3J0RGF0YVsga2V5IF0gPSBnZXRTb3J0RGF0YVsga2V5IF0oICR0aGlzLCBpbnN0YW5jZSApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBhcHBseSBzb3J0IGRhdGEgdG8gZWxlbWVudFxuICAgICAgICAkLmRhdGEoIHRoaXMsICdpc290b3BlLXNvcnQtZGF0YScsIHNvcnREYXRhICk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gdXNlZCBvbiBhbGwgdGhlIGZpbHRlcmVkIGF0b21zXG4gICAgX3NvcnQgOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHNvcnRCeSA9IHRoaXMub3B0aW9ucy5zb3J0QnksXG4gICAgICAgICAgZ2V0U29ydGVyID0gdGhpcy5fZ2V0U29ydGVyLFxuICAgICAgICAgIHNvcnREaXIgPSB0aGlzLm9wdGlvbnMuc29ydEFzY2VuZGluZyA/IDEgOiAtMSxcbiAgICAgICAgICBzb3J0Rm4gPSBmdW5jdGlvbiggYWxwaGEsIGJldGEgKSB7XG4gICAgICAgICAgICB2YXIgYSA9IGdldFNvcnRlciggYWxwaGEsIHNvcnRCeSApLFxuICAgICAgICAgICAgICAgIGIgPSBnZXRTb3J0ZXIoIGJldGEsIHNvcnRCeSApO1xuICAgICAgICAgICAgLy8gZmFsbCBiYWNrIHRvIG9yaWdpbmFsIG9yZGVyIGlmIGRhdGEgbWF0Y2hlc1xuICAgICAgICAgICAgaWYgKCBhID09PSBiICYmIHNvcnRCeSAhPT0gJ29yaWdpbmFsLW9yZGVyJykge1xuICAgICAgICAgICAgICBhID0gZ2V0U29ydGVyKCBhbHBoYSwgJ29yaWdpbmFsLW9yZGVyJyApO1xuICAgICAgICAgICAgICBiID0gZ2V0U29ydGVyKCBiZXRhLCAnb3JpZ2luYWwtb3JkZXInICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKCAoIGEgPiBiICkgPyAxIDogKCBhIDwgYiApID8gLTEgOiAwICkgKiBzb3J0RGlyO1xuICAgICAgICAgIH07XG5cbiAgICAgIHRoaXMuJGZpbHRlcmVkQXRvbXMuc29ydCggc29ydEZuICk7XG4gICAgfSxcblxuICAgIF9nZXRTb3J0ZXIgOiBmdW5jdGlvbiggZWxlbSwgc29ydEJ5ICkge1xuICAgICAgcmV0dXJuICQuZGF0YSggZWxlbSwgJ2lzb3RvcGUtc29ydC1kYXRhJyApWyBzb3J0QnkgXTtcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBMYXlvdXQgSGVscGVycyA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICBfdHJhbnNsYXRlIDogZnVuY3Rpb24oIHgsIHkgKSB7XG4gICAgICByZXR1cm4geyB0cmFuc2xhdGUgOiBbIHgsIHkgXSB9O1xuICAgIH0sXG5cbiAgICBfcG9zaXRpb25BYnMgOiBmdW5jdGlvbiggeCwgeSApIHtcbiAgICAgIHJldHVybiB7IGxlZnQ6IHgsIHRvcDogeSB9O1xuICAgIH0sXG5cbiAgICBfcHVzaFBvc2l0aW9uIDogZnVuY3Rpb24oICRlbGVtLCB4LCB5ICkge1xuICAgICAgeCA9IE1hdGgucm91bmQoIHggKyB0aGlzLm9mZnNldC5sZWZ0ICk7XG4gICAgICB5ID0gTWF0aC5yb3VuZCggeSArIHRoaXMub2Zmc2V0LnRvcCApO1xuICAgICAgdmFyIHBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvblN0eWxlcyggeCwgeSApO1xuICAgICAgdGhpcy5zdHlsZVF1ZXVlLnB1c2goeyAkZWw6ICRlbGVtLCBzdHlsZTogcG9zaXRpb24gfSk7XG4gICAgICBpZiAoIHRoaXMub3B0aW9ucy5pdGVtUG9zaXRpb25EYXRhRW5hYmxlZCApIHtcbiAgICAgICAgJGVsZW0uZGF0YSgnaXNvdG9wZS1pdGVtLXBvc2l0aW9uJywge3g6IHgsIHk6IHl9ICk7XG4gICAgICB9XG4gICAgfSxcblxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBHZW5lcmFsIExheW91dCA9PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvLyB1c2VkIG9uIGNvbGxlY3Rpb24gb2YgYXRvbXMgKHNob3VsZCBiZSBmaWx0ZXJlZCwgYW5kIHNvcnRlZCBiZWZvcmUgKVxuICAgIC8vIGFjY2VwdHMgYXRvbXMtdG8tYmUtbGFpZC1vdXQgdG8gc3RhcnQgd2l0aFxuICAgIGxheW91dCA6IGZ1bmN0aW9uKCAkZWxlbXMsIGNhbGxiYWNrICkge1xuXG4gICAgICB2YXIgbGF5b3V0TW9kZSA9IHRoaXMub3B0aW9ucy5sYXlvdXRNb2RlO1xuXG4gICAgICAvLyBsYXlvdXQgbG9naWNcbiAgICAgIHRoaXNbICdfJyArICBsYXlvdXRNb2RlICsgJ0xheW91dCcgXSggJGVsZW1zICk7XG5cbiAgICAgIC8vIHNldCB0aGUgc2l6ZSBvZiB0aGUgY29udGFpbmVyXG4gICAgICBpZiAoIHRoaXMub3B0aW9ucy5yZXNpemVzQ29udGFpbmVyICkge1xuICAgICAgICB2YXIgY29udGFpbmVyU3R5bGUgPSB0aGlzWyAnXycgKyAgbGF5b3V0TW9kZSArICdHZXRDb250YWluZXJTaXplJyBdKCk7XG4gICAgICAgIHRoaXMuc3R5bGVRdWV1ZS5wdXNoKHsgJGVsOiB0aGlzLmVsZW1lbnQsIHN0eWxlOiBjb250YWluZXJTdHlsZSB9KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcHJvY2Vzc1N0eWxlUXVldWUoICRlbGVtcywgY2FsbGJhY2sgKTtcblxuICAgICAgdGhpcy5pc0xhaWRPdXQgPSB0cnVlO1xuICAgIH0sXG5cbiAgICBfcHJvY2Vzc1N0eWxlUXVldWUgOiBmdW5jdGlvbiggJGVsZW1zLCBjYWxsYmFjayApIHtcbiAgICAgIC8vIGFyZSB3ZSBhbmltYXRpbmcgdGhlIGxheW91dCBhcnJhbmdlbWVudD9cbiAgICAgIC8vIHVzZSBwbHVnaW4taXNoIHN5bnRheCBmb3IgY3NzIG9yIGFuaW1hdGVcbiAgICAgIHZhciBzdHlsZUZuID0gIXRoaXMuaXNMYWlkT3V0ID8gJ2NzcycgOiAoXG4gICAgICAgICAgICB0aGlzLmlzVXNpbmdKUXVlcnlBbmltYXRpb24gPyAnYW5pbWF0ZScgOiAnY3NzJ1xuICAgICAgICAgICksXG4gICAgICAgICAgYW5pbU9wdHMgPSB0aGlzLm9wdGlvbnMuYW5pbWF0aW9uT3B0aW9ucyxcbiAgICAgICAgICBvbkxheW91dCA9IHRoaXMub3B0aW9ucy5vbkxheW91dCxcbiAgICAgICAgICBvYmpTdHlsZUZuLCBwcm9jZXNzb3IsXG4gICAgICAgICAgdHJpZ2dlckNhbGxiYWNrTm93LCBjYWxsYmFja0ZuO1xuXG4gICAgICAvLyBkZWZhdWx0IHN0eWxlUXVldWUgcHJvY2Vzc29yLCBtYXkgYmUgb3ZlcndyaXR0ZW4gZG93biBiZWxvd1xuICAgICAgcHJvY2Vzc29yID0gZnVuY3Rpb24oIGksIG9iaiApIHtcbiAgICAgICAgb2JqLiRlbFsgc3R5bGVGbiBdKCBvYmouc3R5bGUsIGFuaW1PcHRzICk7XG4gICAgICB9O1xuXG4gICAgICBpZiAoIHRoaXMuX2lzSW5zZXJ0aW5nICYmIHRoaXMuaXNVc2luZ0pRdWVyeUFuaW1hdGlvbiApIHtcbiAgICAgICAgLy8gaWYgdXNpbmcgc3R5bGVRdWV1ZSB0byBpbnNlcnQgaXRlbXNcbiAgICAgICAgcHJvY2Vzc29yID0gZnVuY3Rpb24oIGksIG9iaiApIHtcbiAgICAgICAgICAvLyBvbmx5IGFuaW1hdGUgaWYgaXQgbm90IGJlaW5nIGluc2VydGVkXG4gICAgICAgICAgb2JqU3R5bGVGbiA9IG9iai4kZWwuaGFzQ2xhc3MoJ25vLXRyYW5zaXRpb24nKSA/ICdjc3MnIDogc3R5bGVGbjtcbiAgICAgICAgICBvYmouJGVsWyBvYmpTdHlsZUZuIF0oIG9iai5zdHlsZSwgYW5pbU9wdHMgKTtcbiAgICAgICAgfTtcblxuICAgICAgfSBlbHNlIGlmICggY2FsbGJhY2sgfHwgb25MYXlvdXQgfHwgYW5pbU9wdHMuY29tcGxldGUgKSB7XG4gICAgICAgIC8vIGhhcyBjYWxsYmFja1xuICAgICAgICB2YXIgaXNDYWxsYmFja1RyaWdnZXJlZCA9IGZhbHNlLFxuICAgICAgICAgICAgLy8gYXJyYXkgb2YgcG9zc2libGUgY2FsbGJhY2tzIHRvIHRyaWdnZXJcbiAgICAgICAgICAgIGNhbGxiYWNrcyA9IFsgY2FsbGJhY2ssIG9uTGF5b3V0LCBhbmltT3B0cy5jb21wbGV0ZSBdLFxuICAgICAgICAgICAgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgICB0cmlnZ2VyQ2FsbGJhY2tOb3cgPSB0cnVlO1xuICAgICAgICAvLyB0cmlnZ2VyIGNhbGxiYWNrIG9ubHkgb25jZVxuICAgICAgICBjYWxsYmFja0ZuID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCBpc0NhbGxiYWNrVHJpZ2dlcmVkICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXIgaG9sbGFiYWNrO1xuICAgICAgICAgIGZvciAodmFyIGk9MCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBob2xsYWJhY2sgPSBjYWxsYmFja3NbaV07XG4gICAgICAgICAgICBpZiAoIHR5cGVvZiBob2xsYWJhY2sgPT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgICAgIGhvbGxhYmFjay5jYWxsKCBpbnN0YW5jZS5lbGVtZW50LCAkZWxlbXMsIGluc3RhbmNlICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlzQ2FsbGJhY2tUcmlnZ2VyZWQgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICggdGhpcy5pc1VzaW5nSlF1ZXJ5QW5pbWF0aW9uICYmIHN0eWxlRm4gPT09ICdhbmltYXRlJyApIHtcbiAgICAgICAgICAvLyBhZGQgY2FsbGJhY2sgdG8gYW5pbWF0aW9uIG9wdGlvbnNcbiAgICAgICAgICBhbmltT3B0cy5jb21wbGV0ZSA9IGNhbGxiYWNrRm47XG4gICAgICAgICAgdHJpZ2dlckNhbGxiYWNrTm93ID0gZmFsc2U7XG5cbiAgICAgICAgfSBlbHNlIGlmICggTW9kZXJuaXpyLmNzc3RyYW5zaXRpb25zICkge1xuICAgICAgICAgIC8vIGRldGVjdCBpZiBmaXJzdCBpdGVtIGhhcyB0cmFuc2l0aW9uXG4gICAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgICBmaXJzdEl0ZW0gPSB0aGlzLnN0eWxlUXVldWVbMF0sXG4gICAgICAgICAgICAgIHRlc3RFbGVtID0gZmlyc3RJdGVtICYmIGZpcnN0SXRlbS4kZWwsXG4gICAgICAgICAgICAgIHN0eWxlT2JqO1xuICAgICAgICAgIC8vIGdldCBmaXJzdCBub24tZW1wdHkgalEgb2JqZWN0XG4gICAgICAgICAgd2hpbGUgKCAhdGVzdEVsZW0gfHwgIXRlc3RFbGVtLmxlbmd0aCApIHtcbiAgICAgICAgICAgIHN0eWxlT2JqID0gdGhpcy5zdHlsZVF1ZXVlWyBpKysgXTtcbiAgICAgICAgICAgIC8vIEhBQ0s6IHNvbWV0aW1lcyBzdHlsZVF1ZXVlW2ldIGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgaWYgKCAhc3R5bGVPYmogKSB7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRlc3RFbGVtID0gc3R5bGVPYmouJGVsO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBnZXQgdHJhbnNpdGlvbiBkdXJhdGlvbiBvZiB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGF0IG9iamVjdFxuICAgICAgICAgIC8vIHllYWgsIHRoaXMgaXMgaW5leGFjdFxuICAgICAgICAgIHZhciBkdXJhdGlvbiA9IHBhcnNlRmxvYXQoIGdldENvbXB1dGVkU3R5bGUoIHRlc3RFbGVtWzBdIClbIHRyYW5zaXRpb25EdXJQcm9wIF0gKTtcbiAgICAgICAgICBpZiAoIGR1cmF0aW9uID4gMCApIHtcbiAgICAgICAgICAgIHByb2Nlc3NvciA9IGZ1bmN0aW9uKCBpLCBvYmogKSB7XG4gICAgICAgICAgICAgIG9iai4kZWxbIHN0eWxlRm4gXSggb2JqLnN0eWxlLCBhbmltT3B0cyApXG4gICAgICAgICAgICAgICAgLy8gdHJpZ2dlciBjYWxsYmFjayBhdCB0cmFuc2l0aW9uIGVuZFxuICAgICAgICAgICAgICAgIC5vbmUoIHRyYW5zaXRpb25FbmRFdmVudCwgY2FsbGJhY2tGbiApO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRyaWdnZXJDYWxsYmFja05vdyA9IGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIHN0eWxlUXVldWVcbiAgICAgICQuZWFjaCggdGhpcy5zdHlsZVF1ZXVlLCBwcm9jZXNzb3IgKTtcblxuICAgICAgaWYgKCB0cmlnZ2VyQ2FsbGJhY2tOb3cgKSB7XG4gICAgICAgIGNhbGxiYWNrRm4oKTtcbiAgICAgIH1cblxuICAgICAgLy8gY2xlYXIgb3V0IHF1ZXVlIGZvciBuZXh0IHRpbWVcbiAgICAgIHRoaXMuc3R5bGVRdWV1ZSA9IFtdO1xuICAgIH0sXG5cblxuICAgIHJlc2l6ZSA6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCB0aGlzWyAnXycgKyB0aGlzLm9wdGlvbnMubGF5b3V0TW9kZSArICdSZXNpemVDaGFuZ2VkJyBdKCkgKSB7XG4gICAgICAgIHRoaXMucmVMYXlvdXQoKTtcbiAgICAgIH1cbiAgICB9LFxuXG5cbiAgICByZUxheW91dCA6IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcblxuICAgICAgdGhpc1sgJ18nICsgIHRoaXMub3B0aW9ucy5sYXlvdXRNb2RlICsgJ1Jlc2V0JyBdKCk7XG4gICAgICB0aGlzLmxheW91dCggdGhpcy4kZmlsdGVyZWRBdG9tcywgY2FsbGJhY2sgKTtcblxuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09IENvbnZlbmllbmNlIG1ldGhvZHMgPT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBBZGRpbmcgaXRlbXMgPT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gYWRkcyBhIGpRdWVyeSBvYmplY3Qgb2YgaXRlbXMgdG8gYSBpc290b3BlIGNvbnRhaW5lclxuICAgIGFkZEl0ZW1zIDogZnVuY3Rpb24oICRjb250ZW50LCBjYWxsYmFjayApIHtcbiAgICAgIHZhciAkbmV3QXRvbXMgPSB0aGlzLl9nZXRBdG9tcyggJGNvbnRlbnQgKTtcbiAgICAgIC8vIGFkZCBuZXcgYXRvbXMgdG8gYXRvbXMgcG9vbHNcbiAgICAgIHRoaXMuJGFsbEF0b21zID0gdGhpcy4kYWxsQXRvbXMuYWRkKCAkbmV3QXRvbXMgKTtcblxuICAgICAgaWYgKCBjYWxsYmFjayApIHtcbiAgICAgICAgY2FsbGJhY2soICRuZXdBdG9tcyApO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBjb252aWVuZW5jZSBtZXRob2QgZm9yIGFkZGluZyBlbGVtZW50cyBwcm9wZXJseSB0byBhbnkgbGF5b3V0XG4gICAgLy8gcG9zaXRpb25zIGl0ZW1zLCBoaWRlcyB0aGVtLCB0aGVuIGFuaW1hdGVzIHRoZW0gYmFjayBpbiA8LS0tIHZlcnkgc2V6enlcbiAgICBpbnNlcnQgOiBmdW5jdGlvbiggJGNvbnRlbnQsIGNhbGxiYWNrICkge1xuICAgICAgLy8gcG9zaXRpb24gaXRlbXNcbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmQoICRjb250ZW50ICk7XG5cbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICB0aGlzLmFkZEl0ZW1zKCAkY29udGVudCwgZnVuY3Rpb24oICRuZXdBdG9tcyApIHtcbiAgICAgICAgdmFyICRuZXdGaWx0ZXJlZEF0b21zID0gaW5zdGFuY2UuX2ZpbHRlciggJG5ld0F0b21zICk7XG4gICAgICAgIGluc3RhbmNlLl9hZGRIaWRlQXBwZW5kZWQoICRuZXdGaWx0ZXJlZEF0b21zICk7XG4gICAgICAgIGluc3RhbmNlLl9zb3J0KCk7XG4gICAgICAgIGluc3RhbmNlLnJlTGF5b3V0KCk7XG4gICAgICAgIGluc3RhbmNlLl9yZXZlYWxBcHBlbmRlZCggJG5ld0ZpbHRlcmVkQXRvbXMsIGNhbGxiYWNrICk7XG4gICAgICB9KTtcblxuICAgIH0sXG5cbiAgICAvLyBjb252aWVuZW5jZSBtZXRob2QgZm9yIHdvcmtpbmcgd2l0aCBJbmZpbml0ZSBTY3JvbGxcbiAgICBhcHBlbmRlZCA6IGZ1bmN0aW9uKCAkY29udGVudCwgY2FsbGJhY2sgKSB7XG4gICAgICB2YXIgaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgdGhpcy5hZGRJdGVtcyggJGNvbnRlbnQsIGZ1bmN0aW9uKCAkbmV3QXRvbXMgKSB7XG4gICAgICAgIGluc3RhbmNlLl9hZGRIaWRlQXBwZW5kZWQoICRuZXdBdG9tcyApO1xuICAgICAgICBpbnN0YW5jZS5sYXlvdXQoICRuZXdBdG9tcyApO1xuICAgICAgICBpbnN0YW5jZS5fcmV2ZWFsQXBwZW5kZWQoICRuZXdBdG9tcywgY2FsbGJhY2sgKTtcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvLyBhZGRzIG5ldyBhdG9tcywgdGhlbiBoaWRlcyB0aGVtIGJlZm9yZSBwb3NpdGlvbmluZ1xuICAgIF9hZGRIaWRlQXBwZW5kZWQgOiBmdW5jdGlvbiggJG5ld0F0b21zICkge1xuICAgICAgdGhpcy4kZmlsdGVyZWRBdG9tcyA9IHRoaXMuJGZpbHRlcmVkQXRvbXMuYWRkKCAkbmV3QXRvbXMgKTtcbiAgICAgICRuZXdBdG9tcy5hZGRDbGFzcygnbm8tdHJhbnNpdGlvbicpO1xuXG4gICAgICB0aGlzLl9pc0luc2VydGluZyA9IHRydWU7XG5cbiAgICAgIC8vIGFwcGx5IGhpZGRlbiBzdHlsZXNcbiAgICAgIHRoaXMuc3R5bGVRdWV1ZS5wdXNoKHsgJGVsOiAkbmV3QXRvbXMsIHN0eWxlOiB0aGlzLm9wdGlvbnMuaGlkZGVuU3R5bGUgfSk7XG4gICAgfSxcblxuICAgIC8vIHNldHMgdmlzaWJsZSBzdHlsZSBvbiBuZXcgYXRvbXNcbiAgICBfcmV2ZWFsQXBwZW5kZWQgOiBmdW5jdGlvbiggJG5ld0F0b21zLCBjYWxsYmFjayApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICAvLyBhcHBseSB2aXNpYmxlIHN0eWxlIGFmdGVyIGEgc2VjXG4gICAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gZW5hYmxlIGFuaW1hdGlvblxuICAgICAgICAkbmV3QXRvbXMucmVtb3ZlQ2xhc3MoJ25vLXRyYW5zaXRpb24nKTtcbiAgICAgICAgLy8gcmV2ZWFsIG5ld2x5IGluc2VydGVkIGZpbHRlcmVkIGVsZW1lbnRzXG4gICAgICAgIGluc3RhbmNlLnN0eWxlUXVldWUucHVzaCh7ICRlbDogJG5ld0F0b21zLCBzdHlsZTogaW5zdGFuY2Uub3B0aW9ucy52aXNpYmxlU3R5bGUgfSk7XG4gICAgICAgIGluc3RhbmNlLl9pc0luc2VydGluZyA9IGZhbHNlO1xuICAgICAgICBpbnN0YW5jZS5fcHJvY2Vzc1N0eWxlUXVldWUoICRuZXdBdG9tcywgY2FsbGJhY2sgKTtcbiAgICAgIH0sIDEwICk7XG4gICAgfSxcblxuICAgIC8vIGdhdGhlcnMgYWxsIGF0b21zXG4gICAgcmVsb2FkSXRlbXMgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuJGFsbEF0b21zID0gdGhpcy5fZ2V0QXRvbXMoIHRoaXMuZWxlbWVudC5jaGlsZHJlbigpICk7XG4gICAgfSxcblxuICAgIC8vIHJlbW92ZXMgZWxlbWVudHMgZnJvbSBJc290b3BlIHdpZGdldFxuICAgIHJlbW92ZTogZnVuY3Rpb24oICRjb250ZW50LCBjYWxsYmFjayApIHtcbiAgICAgIC8vIHJlbW92ZSBlbGVtZW50cyBpbW1lZGlhdGVseSBmcm9tIElzb3RvcGUgaW5zdGFuY2VcbiAgICAgIHRoaXMuJGFsbEF0b21zID0gdGhpcy4kYWxsQXRvbXMubm90KCAkY29udGVudCApO1xuICAgICAgdGhpcy4kZmlsdGVyZWRBdG9tcyA9IHRoaXMuJGZpbHRlcmVkQXRvbXMubm90KCAkY29udGVudCApO1xuICAgICAgLy8gcmVtb3ZlKCkgYXMgYSBjYWxsYmFjaywgZm9yIGFmdGVyIHRyYW5zaXRpb24gLyBhbmltYXRpb25cbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICB2YXIgcmVtb3ZlQ29udGVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkY29udGVudC5yZW1vdmUoKTtcbiAgICAgICAgaWYgKCBjYWxsYmFjayApIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKCBpbnN0YW5jZS5lbGVtZW50ICk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmICggJGNvbnRlbnQuZmlsdGVyKCAnOm5vdCguJyArIHRoaXMub3B0aW9ucy5oaWRkZW5DbGFzcyArICcpJyApLmxlbmd0aCApIHtcbiAgICAgICAgLy8gaWYgYW55IG5vbi1oaWRkZW4gY29udGVudCBuZWVkcyB0byBiZSByZW1vdmVkXG4gICAgICAgIHRoaXMuc3R5bGVRdWV1ZS5wdXNoKHsgJGVsOiAkY29udGVudCwgc3R5bGU6IHRoaXMub3B0aW9ucy5oaWRkZW5TdHlsZSB9KTtcbiAgICAgICAgdGhpcy5fc29ydCgpO1xuICAgICAgICB0aGlzLnJlTGF5b3V0KCByZW1vdmVDb250ZW50ICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyByZW1vdmUgaXQgbm93XG4gICAgICAgIHJlbW92ZUNvbnRlbnQoKTtcbiAgICAgIH1cblxuICAgIH0sXG5cbiAgICBzaHVmZmxlIDogZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuICAgICAgdGhpcy51cGRhdGVTb3J0RGF0YSggdGhpcy4kYWxsQXRvbXMgKTtcbiAgICAgIHRoaXMub3B0aW9ucy5zb3J0QnkgPSAncmFuZG9tJztcbiAgICAgIHRoaXMuX3NvcnQoKTtcbiAgICAgIHRoaXMucmVMYXlvdXQoIGNhbGxiYWNrICk7XG4gICAgfSxcblxuICAgIC8vIGRlc3Ryb3lzIHdpZGdldCwgcmV0dXJucyBlbGVtZW50cyBhbmQgY29udGFpbmVyIGJhY2sgKGNsb3NlKSB0byBvcmlnaW5hbCBzdHlsZVxuICAgIGRlc3Ryb3kgOiBmdW5jdGlvbigpIHtcblxuICAgICAgdmFyIHVzaW5nVHJhbnNmb3JtcyA9IHRoaXMudXNpbmdUcmFuc2Zvcm1zO1xuICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgIHRoaXMuJGFsbEF0b21zXG4gICAgICAgIC5yZW1vdmVDbGFzcyggb3B0aW9ucy5oaWRkZW5DbGFzcyArICcgJyArIG9wdGlvbnMuaXRlbUNsYXNzIClcbiAgICAgICAgLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICB2YXIgc3R5bGUgPSB0aGlzLnN0eWxlO1xuICAgICAgICAgIHN0eWxlLnBvc2l0aW9uID0gJyc7XG4gICAgICAgICAgc3R5bGUudG9wID0gJyc7XG4gICAgICAgICAgc3R5bGUubGVmdCA9ICcnO1xuICAgICAgICAgIHN0eWxlLm9wYWNpdHkgPSAnJztcbiAgICAgICAgICBpZiAoIHVzaW5nVHJhbnNmb3JtcyApIHtcbiAgICAgICAgICAgIHN0eWxlWyB0cmFuc2Zvcm1Qcm9wIF0gPSAnJztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAvLyByZS1hcHBseSBzYXZlZCBjb250YWluZXIgc3R5bGVzXG4gICAgICB2YXIgZWxlbVN0eWxlID0gdGhpcy5lbGVtZW50WzBdLnN0eWxlO1xuICAgICAgZm9yICggdmFyIHByb3AgaW4gdGhpcy5vcmlnaW5hbFN0eWxlICkge1xuICAgICAgICBlbGVtU3R5bGVbIHByb3AgXSA9IHRoaXMub3JpZ2luYWxTdHlsZVsgcHJvcCBdO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmVsZW1lbnRcbiAgICAgICAgLnVuYmluZCgnLmlzb3RvcGUnKVxuICAgICAgICAudW5kZWxlZ2F0ZSggJy4nICsgb3B0aW9ucy5oaWRkZW5DbGFzcywgJ2NsaWNrJyApXG4gICAgICAgIC5yZW1vdmVDbGFzcyggb3B0aW9ucy5jb250YWluZXJDbGFzcyApXG4gICAgICAgIC5yZW1vdmVEYXRhKCdpc290b3BlJyk7XG5cbiAgICAgICR3aW5kb3cudW5iaW5kKCcuaXNvdG9wZScpO1xuXG4gICAgfSxcblxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBMQVlPVVRTID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIGNhbGN1bGF0ZXMgbnVtYmVyIG9mIHJvd3Mgb3IgY29sdW1uc1xuICAgIC8vIHJlcXVpcmVzIGNvbHVtbldpZHRoIG9yIHJvd0hlaWdodCB0byBiZSBzZXQgb24gbmFtZXNwYWNlZCBvYmplY3RcbiAgICAvLyBpLmUuIHRoaXMubWFzb25yeS5jb2x1bW5XaWR0aCA9IDIwMFxuICAgIF9nZXRTZWdtZW50cyA6IGZ1bmN0aW9uKCBpc1Jvd3MgKSB7XG4gICAgICB2YXIgbmFtZXNwYWNlID0gdGhpcy5vcHRpb25zLmxheW91dE1vZGUsXG4gICAgICAgICAgbWVhc3VyZSAgPSBpc1Jvd3MgPyAncm93SGVpZ2h0JyA6ICdjb2x1bW5XaWR0aCcsXG4gICAgICAgICAgc2l6ZSAgICAgPSBpc1Jvd3MgPyAnaGVpZ2h0JyA6ICd3aWR0aCcsXG4gICAgICAgICAgc2VnbWVudHNOYW1lID0gaXNSb3dzID8gJ3Jvd3MnIDogJ2NvbHMnLFxuICAgICAgICAgIGNvbnRhaW5lclNpemUgPSB0aGlzLmVsZW1lbnRbIHNpemUgXSgpLFxuICAgICAgICAgIHNlZ21lbnRzLFxuICAgICAgICAgICAgICAgICAgICAvLyBpLmUuIG9wdGlvbnMubWFzb25yeSAmJiBvcHRpb25zLm1hc29ucnkuY29sdW1uV2lkdGhcbiAgICAgICAgICBzZWdtZW50U2l6ZSA9IHRoaXMub3B0aW9uc1sgbmFtZXNwYWNlIF0gJiYgdGhpcy5vcHRpb25zWyBuYW1lc3BhY2UgXVsgbWVhc3VyZSBdIHx8XG4gICAgICAgICAgICAgICAgICAgIC8vIG9yIHVzZSB0aGUgc2l6ZSBvZiB0aGUgZmlyc3QgaXRlbSwgaS5lLiBvdXRlcldpZHRoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuJGZpbHRlcmVkQXRvbXNbICdvdXRlcicgKyBjYXBpdGFsaXplKHNpemUpIF0odHJ1ZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUncyBubyBpdGVtcywgdXNlIHNpemUgb2YgY29udGFpbmVyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lclNpemU7XG5cbiAgICAgIHNlZ21lbnRzID0gTWF0aC5mbG9vciggY29udGFpbmVyU2l6ZSAvIHNlZ21lbnRTaXplICk7XG4gICAgICBzZWdtZW50cyA9IE1hdGgubWF4KCBzZWdtZW50cywgMSApO1xuXG4gICAgICAvLyBpLmUuIHRoaXMubWFzb25yeS5jb2xzID0gLi4uLlxuICAgICAgdGhpc1sgbmFtZXNwYWNlIF1bIHNlZ21lbnRzTmFtZSBdID0gc2VnbWVudHM7XG4gICAgICAvLyBpLmUuIHRoaXMubWFzb25yeS5jb2x1bW5XaWR0aCA9IC4uLlxuICAgICAgdGhpc1sgbmFtZXNwYWNlIF1bIG1lYXN1cmUgXSA9IHNlZ21lbnRTaXplO1xuXG4gICAgfSxcblxuICAgIF9jaGVja0lmU2VnbWVudHNDaGFuZ2VkIDogZnVuY3Rpb24oIGlzUm93cyApIHtcbiAgICAgIHZhciBuYW1lc3BhY2UgPSB0aGlzLm9wdGlvbnMubGF5b3V0TW9kZSxcbiAgICAgICAgICBzZWdtZW50c05hbWUgPSBpc1Jvd3MgPyAncm93cycgOiAnY29scycsXG4gICAgICAgICAgcHJldlNlZ21lbnRzID0gdGhpc1sgbmFtZXNwYWNlIF1bIHNlZ21lbnRzTmFtZSBdO1xuICAgICAgLy8gdXBkYXRlIGNvbHMvcm93c1xuICAgICAgdGhpcy5fZ2V0U2VnbWVudHMoIGlzUm93cyApO1xuICAgICAgLy8gcmV0dXJuIGlmIHVwZGF0ZWQgY29scy9yb3dzIGlzIG5vdCBlcXVhbCB0byBwcmV2aW91c1xuICAgICAgcmV0dXJuICggdGhpc1sgbmFtZXNwYWNlIF1bIHNlZ21lbnRzTmFtZSBdICE9PSBwcmV2U2VnbWVudHMgKTtcbiAgICB9LFxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBNYXNvbnJ5ID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9tYXNvbnJ5UmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGxheW91dC1zcGVjaWZpYyBwcm9wc1xuICAgICAgdGhpcy5tYXNvbnJ5ID0ge307XG4gICAgICAvLyBGSVhNRSBzaG91bGRuJ3QgaGF2ZSB0byBjYWxsIHRoaXMgYWdhaW5cbiAgICAgIHRoaXMuX2dldFNlZ21lbnRzKCk7XG4gICAgICB2YXIgaSA9IHRoaXMubWFzb25yeS5jb2xzO1xuICAgICAgdGhpcy5tYXNvbnJ5LmNvbFlzID0gW107XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHRoaXMubWFzb25yeS5jb2xZcy5wdXNoKCAwICk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIF9tYXNvbnJ5TGF5b3V0IDogZnVuY3Rpb24oICRlbGVtcyApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMsXG4gICAgICAgICAgcHJvcHMgPSBpbnN0YW5jZS5tYXNvbnJ5O1xuICAgICAgJGVsZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyICR0aGlzICA9ICQodGhpcyksXG4gICAgICAgICAgICAvL2hvdyBtYW55IGNvbHVtbnMgZG9lcyB0aGlzIGJyaWNrIHNwYW5cbiAgICAgICAgICAgIGNvbFNwYW4gPSBNYXRoLmNlaWwoICR0aGlzLm91dGVyV2lkdGgodHJ1ZSkgLyBwcm9wcy5jb2x1bW5XaWR0aCApO1xuICAgICAgICBjb2xTcGFuID0gTWF0aC5taW4oIGNvbFNwYW4sIHByb3BzLmNvbHMgKTtcblxuICAgICAgICBpZiAoIGNvbFNwYW4gPT09IDEgKSB7XG4gICAgICAgICAgLy8gaWYgYnJpY2sgc3BhbnMgb25seSBvbmUgY29sdW1uLCBqdXN0IGxpa2Ugc2luZ2xlTW9kZVxuICAgICAgICAgIGluc3RhbmNlLl9tYXNvbnJ5UGxhY2VCcmljayggJHRoaXMsIHByb3BzLmNvbFlzICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gYnJpY2sgc3BhbnMgbW9yZSB0aGFuIG9uZSBjb2x1bW5cbiAgICAgICAgICAvLyBob3cgbWFueSBkaWZmZXJlbnQgcGxhY2VzIGNvdWxkIHRoaXMgYnJpY2sgZml0IGhvcml6b250YWxseVxuICAgICAgICAgIHZhciBncm91cENvdW50ID0gcHJvcHMuY29scyArIDEgLSBjb2xTcGFuLFxuICAgICAgICAgICAgICBncm91cFkgPSBbXSxcbiAgICAgICAgICAgICAgZ3JvdXBDb2xZLFxuICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgLy8gZm9yIGVhY2ggZ3JvdXAgcG90ZW50aWFsIGhvcml6b250YWwgcG9zaXRpb25cbiAgICAgICAgICBmb3IgKCBpPTA7IGkgPCBncm91cENvdW50OyBpKysgKSB7XG4gICAgICAgICAgICAvLyBtYWtlIGFuIGFycmF5IG9mIGNvbFkgdmFsdWVzIGZvciB0aGF0IG9uZSBncm91cFxuICAgICAgICAgICAgZ3JvdXBDb2xZID0gcHJvcHMuY29sWXMuc2xpY2UoIGksIGkrY29sU3BhbiApO1xuICAgICAgICAgICAgLy8gYW5kIGdldCB0aGUgbWF4IHZhbHVlIG9mIHRoZSBhcnJheVxuICAgICAgICAgICAgZ3JvdXBZW2ldID0gTWF0aC5tYXguYXBwbHkoIE1hdGgsIGdyb3VwQ29sWSApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGluc3RhbmNlLl9tYXNvbnJ5UGxhY2VCcmljayggJHRoaXMsIGdyb3VwWSApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgLy8gd29ya2VyIG1ldGhvZCB0aGF0IHBsYWNlcyBicmljayBpbiB0aGUgY29sdW1uU2V0XG4gICAgLy8gICB3aXRoIHRoZSB0aGUgbWluWVxuICAgIF9tYXNvbnJ5UGxhY2VCcmljayA6IGZ1bmN0aW9uKCAkYnJpY2ssIHNldFkgKSB7XG4gICAgICAvLyBnZXQgdGhlIG1pbmltdW0gWSB2YWx1ZSBmcm9tIHRoZSBjb2x1bW5zXG4gICAgICB2YXIgbWluaW11bVkgPSBNYXRoLm1pbi5hcHBseSggTWF0aCwgc2V0WSApLFxuICAgICAgICAgIHNob3J0Q29sID0gMDtcblxuICAgICAgLy8gRmluZCBpbmRleCBvZiBzaG9ydCBjb2x1bW4sIHRoZSBmaXJzdCBmcm9tIHRoZSBsZWZ0XG4gICAgICBmb3IgKHZhciBpPTAsIGxlbiA9IHNldFkubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKCBzZXRZW2ldID09PSBtaW5pbXVtWSApIHtcbiAgICAgICAgICBzaG9ydENvbCA9IGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcG9zaXRpb24gdGhlIGJyaWNrXG4gICAgICB2YXIgeCA9IHRoaXMubWFzb25yeS5jb2x1bW5XaWR0aCAqIHNob3J0Q29sLFxuICAgICAgICAgIHkgPSBtaW5pbXVtWTtcbiAgICAgIHRoaXMuX3B1c2hQb3NpdGlvbiggJGJyaWNrLCB4LCB5ICk7XG5cbiAgICAgIC8vIGFwcGx5IHNldEhlaWdodCB0byBuZWNlc3NhcnkgY29sdW1uc1xuICAgICAgdmFyIHNldEhlaWdodCA9IG1pbmltdW1ZICsgJGJyaWNrLm91dGVySGVpZ2h0KHRydWUpLFxuICAgICAgICAgIHNldFNwYW4gPSB0aGlzLm1hc29ucnkuY29scyArIDEgLSBsZW47XG4gICAgICBmb3IgKCBpPTA7IGkgPCBzZXRTcGFuOyBpKysgKSB7XG4gICAgICAgIHRoaXMubWFzb25yeS5jb2xZc1sgc2hvcnRDb2wgKyBpIF0gPSBzZXRIZWlnaHQ7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgX21hc29ucnlHZXRDb250YWluZXJTaXplIDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY29udGFpbmVySGVpZ2h0ID0gTWF0aC5tYXguYXBwbHkoIE1hdGgsIHRoaXMubWFzb25yeS5jb2xZcyApO1xuICAgICAgcmV0dXJuIHsgaGVpZ2h0OiBjb250YWluZXJIZWlnaHQgfTtcbiAgICB9LFxuXG4gICAgX21hc29ucnlSZXNpemVDaGFuZ2VkIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2hlY2tJZlNlZ21lbnRzQ2hhbmdlZCgpO1xuICAgIH0sXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09IGZpdFJvd3MgPT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX2ZpdFJvd3NSZXNldCA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5maXRSb3dzID0ge1xuICAgICAgICB4IDogMCxcbiAgICAgICAgeSA6IDAsXG4gICAgICAgIGhlaWdodCA6IDBcbiAgICAgIH07XG4gICAgfSxcblxuICAgIF9maXRSb3dzTGF5b3V0IDogZnVuY3Rpb24oICRlbGVtcyApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMsXG4gICAgICAgICAgY29udGFpbmVyV2lkdGggPSB0aGlzLmVsZW1lbnQud2lkdGgoKSxcbiAgICAgICAgICBwcm9wcyA9IHRoaXMuZml0Um93cztcblxuICAgICAgJGVsZW1zLmVhY2goIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgYXRvbVcgPSAkdGhpcy5vdXRlcldpZHRoKHRydWUpLFxuICAgICAgICAgICAgYXRvbUggPSAkdGhpcy5vdXRlckhlaWdodCh0cnVlKTtcblxuICAgICAgICBpZiAoIHByb3BzLnggIT09IDAgJiYgYXRvbVcgKyBwcm9wcy54ID4gY29udGFpbmVyV2lkdGggKSB7XG4gICAgICAgICAgLy8gaWYgdGhpcyBlbGVtZW50IGNhbm5vdCBmaXQgaW4gdGhlIGN1cnJlbnQgcm93XG4gICAgICAgICAgcHJvcHMueCA9IDA7XG4gICAgICAgICAgcHJvcHMueSA9IHByb3BzLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBvc2l0aW9uIHRoZSBhdG9tXG4gICAgICAgIGluc3RhbmNlLl9wdXNoUG9zaXRpb24oICR0aGlzLCBwcm9wcy54LCBwcm9wcy55ICk7XG5cbiAgICAgICAgcHJvcHMuaGVpZ2h0ID0gTWF0aC5tYXgoIHByb3BzLnkgKyBhdG9tSCwgcHJvcHMuaGVpZ2h0ICk7XG4gICAgICAgIHByb3BzLnggKz0gYXRvbVc7XG5cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfZml0Um93c0dldENvbnRhaW5lclNpemUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4geyBoZWlnaHQgOiB0aGlzLmZpdFJvd3MuaGVpZ2h0IH07XG4gICAgfSxcblxuICAgIF9maXRSb3dzUmVzaXplQ2hhbmdlZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBjZWxsc0J5Um93ID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9jZWxsc0J5Um93UmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2VsbHNCeVJvdyA9IHtcbiAgICAgICAgaW5kZXggOiAwXG4gICAgICB9O1xuICAgICAgLy8gZ2V0IHRoaXMuY2VsbHNCeVJvdy5jb2x1bW5XaWR0aFxuICAgICAgdGhpcy5fZ2V0U2VnbWVudHMoKTtcbiAgICAgIC8vIGdldCB0aGlzLmNlbGxzQnlSb3cucm93SGVpZ2h0XG4gICAgICB0aGlzLl9nZXRTZWdtZW50cyh0cnVlKTtcbiAgICB9LFxuXG4gICAgX2NlbGxzQnlSb3dMYXlvdXQgOiBmdW5jdGlvbiggJGVsZW1zICkge1xuICAgICAgdmFyIGluc3RhbmNlID0gdGhpcyxcbiAgICAgICAgICBwcm9wcyA9IHRoaXMuY2VsbHNCeVJvdztcbiAgICAgICRlbGVtcy5lYWNoKCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgY29sID0gcHJvcHMuaW5kZXggJSBwcm9wcy5jb2xzLFxuICAgICAgICAgICAgcm93ID0gTWF0aC5mbG9vciggcHJvcHMuaW5kZXggLyBwcm9wcy5jb2xzICksXG4gICAgICAgICAgICB4ID0gKCBjb2wgKyAwLjUgKSAqIHByb3BzLmNvbHVtbldpZHRoIC0gJHRoaXMub3V0ZXJXaWR0aCh0cnVlKSAvIDIsXG4gICAgICAgICAgICB5ID0gKCByb3cgKyAwLjUgKSAqIHByb3BzLnJvd0hlaWdodCAtICR0aGlzLm91dGVySGVpZ2h0KHRydWUpIC8gMjtcbiAgICAgICAgaW5zdGFuY2UuX3B1c2hQb3NpdGlvbiggJHRoaXMsIHgsIHkgKTtcbiAgICAgICAgcHJvcHMuaW5kZXggKys7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2NlbGxzQnlSb3dHZXRDb250YWluZXJTaXplIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBoZWlnaHQgOiBNYXRoLmNlaWwoIHRoaXMuJGZpbHRlcmVkQXRvbXMubGVuZ3RoIC8gdGhpcy5jZWxsc0J5Um93LmNvbHMgKSAqIHRoaXMuY2VsbHNCeVJvdy5yb3dIZWlnaHQgKyB0aGlzLm9mZnNldC50b3AgfTtcbiAgICB9LFxuXG4gICAgX2NlbGxzQnlSb3dSZXNpemVDaGFuZ2VkIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2hlY2tJZlNlZ21lbnRzQ2hhbmdlZCgpO1xuICAgIH0sXG5cblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gc3RyYWlnaHREb3duID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9zdHJhaWdodERvd25SZXNldCA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdHJhaWdodERvd24gPSB7XG4gICAgICAgIHkgOiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBfc3RyYWlnaHREb3duTGF5b3V0IDogZnVuY3Rpb24oICRlbGVtcyApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgICAkZWxlbXMuZWFjaCggZnVuY3Rpb24oIGkgKXtcbiAgICAgICAgdmFyICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgaW5zdGFuY2UuX3B1c2hQb3NpdGlvbiggJHRoaXMsIDAsIGluc3RhbmNlLnN0cmFpZ2h0RG93bi55ICk7XG4gICAgICAgIGluc3RhbmNlLnN0cmFpZ2h0RG93bi55ICs9ICR0aGlzLm91dGVySGVpZ2h0KHRydWUpO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9zdHJhaWdodERvd25HZXRDb250YWluZXJTaXplIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyBoZWlnaHQgOiB0aGlzLnN0cmFpZ2h0RG93bi55IH07XG4gICAgfSxcblxuICAgIF9zdHJhaWdodERvd25SZXNpemVDaGFuZ2VkIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09IG1hc29ucnlIb3Jpem9udGFsID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9tYXNvbnJ5SG9yaXpvbnRhbFJlc2V0IDogZnVuY3Rpb24oKSB7XG4gICAgICAvLyBsYXlvdXQtc3BlY2lmaWMgcHJvcHNcbiAgICAgIHRoaXMubWFzb25yeUhvcml6b250YWwgPSB7fTtcbiAgICAgIC8vIEZJWE1FIHNob3VsZG4ndCBoYXZlIHRvIGNhbGwgdGhpcyBhZ2FpblxuICAgICAgdGhpcy5fZ2V0U2VnbWVudHMoIHRydWUgKTtcbiAgICAgIHZhciBpID0gdGhpcy5tYXNvbnJ5SG9yaXpvbnRhbC5yb3dzO1xuICAgICAgdGhpcy5tYXNvbnJ5SG9yaXpvbnRhbC5yb3dYcyA9IFtdO1xuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICB0aGlzLm1hc29ucnlIb3Jpem9udGFsLnJvd1hzLnB1c2goIDAgKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX21hc29ucnlIb3Jpem9udGFsTGF5b3V0IDogZnVuY3Rpb24oICRlbGVtcyApIHtcbiAgICAgIHZhciBpbnN0YW5jZSA9IHRoaXMsXG4gICAgICAgICAgcHJvcHMgPSBpbnN0YW5jZS5tYXNvbnJ5SG9yaXpvbnRhbDtcbiAgICAgICRlbGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIHZhciAkdGhpcyAgPSAkKHRoaXMpLFxuICAgICAgICAgICAgLy9ob3cgbWFueSByb3dzIGRvZXMgdGhpcyBicmljayBzcGFuXG4gICAgICAgICAgICByb3dTcGFuID0gTWF0aC5jZWlsKCAkdGhpcy5vdXRlckhlaWdodCh0cnVlKSAvIHByb3BzLnJvd0hlaWdodCApO1xuICAgICAgICByb3dTcGFuID0gTWF0aC5taW4oIHJvd1NwYW4sIHByb3BzLnJvd3MgKTtcblxuICAgICAgICBpZiAoIHJvd1NwYW4gPT09IDEgKSB7XG4gICAgICAgICAgLy8gaWYgYnJpY2sgc3BhbnMgb25seSBvbmUgY29sdW1uLCBqdXN0IGxpa2Ugc2luZ2xlTW9kZVxuICAgICAgICAgIGluc3RhbmNlLl9tYXNvbnJ5SG9yaXpvbnRhbFBsYWNlQnJpY2soICR0aGlzLCBwcm9wcy5yb3dYcyApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGJyaWNrIHNwYW5zIG1vcmUgdGhhbiBvbmUgcm93XG4gICAgICAgICAgLy8gaG93IG1hbnkgZGlmZmVyZW50IHBsYWNlcyBjb3VsZCB0aGlzIGJyaWNrIGZpdCBob3Jpem9udGFsbHlcbiAgICAgICAgICB2YXIgZ3JvdXBDb3VudCA9IHByb3BzLnJvd3MgKyAxIC0gcm93U3BhbixcbiAgICAgICAgICAgICAgZ3JvdXBYID0gW10sXG4gICAgICAgICAgICAgIGdyb3VwUm93WCwgaTtcblxuICAgICAgICAgIC8vIGZvciBlYWNoIGdyb3VwIHBvdGVudGlhbCBob3Jpem9udGFsIHBvc2l0aW9uXG4gICAgICAgICAgZm9yICggaT0wOyBpIDwgZ3JvdXBDb3VudDsgaSsrICkge1xuICAgICAgICAgICAgLy8gbWFrZSBhbiBhcnJheSBvZiBjb2xZIHZhbHVlcyBmb3IgdGhhdCBvbmUgZ3JvdXBcbiAgICAgICAgICAgIGdyb3VwUm93WCA9IHByb3BzLnJvd1hzLnNsaWNlKCBpLCBpK3Jvd1NwYW4gKTtcbiAgICAgICAgICAgIC8vIGFuZCBnZXQgdGhlIG1heCB2YWx1ZSBvZiB0aGUgYXJyYXlcbiAgICAgICAgICAgIGdyb3VwWFtpXSA9IE1hdGgubWF4LmFwcGx5KCBNYXRoLCBncm91cFJvd1ggKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbnN0YW5jZS5fbWFzb25yeUhvcml6b250YWxQbGFjZUJyaWNrKCAkdGhpcywgZ3JvdXBYICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfbWFzb25yeUhvcml6b250YWxQbGFjZUJyaWNrIDogZnVuY3Rpb24oICRicmljaywgc2V0WCApIHtcbiAgICAgIC8vIGdldCB0aGUgbWluaW11bSBZIHZhbHVlIGZyb20gdGhlIGNvbHVtbnNcbiAgICAgIHZhciBtaW5pbXVtWCAgPSBNYXRoLm1pbi5hcHBseSggTWF0aCwgc2V0WCApLFxuICAgICAgICAgIHNtYWxsUm93ICA9IDA7XG4gICAgICAvLyBGaW5kIGluZGV4IG9mIHNtYWxsZXN0IHJvdywgdGhlIGZpcnN0IGZyb20gdGhlIHRvcFxuICAgICAgZm9yICh2YXIgaT0wLCBsZW4gPSBzZXRYLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmICggc2V0WFtpXSA9PT0gbWluaW11bVggKSB7XG4gICAgICAgICAgc21hbGxSb3cgPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHBvc2l0aW9uIHRoZSBicmlja1xuICAgICAgdmFyIHggPSBtaW5pbXVtWCxcbiAgICAgICAgICB5ID0gdGhpcy5tYXNvbnJ5SG9yaXpvbnRhbC5yb3dIZWlnaHQgKiBzbWFsbFJvdztcbiAgICAgIHRoaXMuX3B1c2hQb3NpdGlvbiggJGJyaWNrLCB4LCB5ICk7XG5cbiAgICAgIC8vIGFwcGx5IHNldEhlaWdodCB0byBuZWNlc3NhcnkgY29sdW1uc1xuICAgICAgdmFyIHNldFdpZHRoID0gbWluaW11bVggKyAkYnJpY2sub3V0ZXJXaWR0aCh0cnVlKSxcbiAgICAgICAgICBzZXRTcGFuID0gdGhpcy5tYXNvbnJ5SG9yaXpvbnRhbC5yb3dzICsgMSAtIGxlbjtcbiAgICAgIGZvciAoIGk9MDsgaSA8IHNldFNwYW47IGkrKyApIHtcbiAgICAgICAgdGhpcy5tYXNvbnJ5SG9yaXpvbnRhbC5yb3dYc1sgc21hbGxSb3cgKyBpIF0gPSBzZXRXaWR0aDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgX21hc29ucnlIb3Jpem9udGFsR2V0Q29udGFpbmVyU2l6ZSA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRhaW5lcldpZHRoID0gTWF0aC5tYXguYXBwbHkoIE1hdGgsIHRoaXMubWFzb25yeUhvcml6b250YWwucm93WHMgKTtcbiAgICAgIHJldHVybiB7IHdpZHRoOiBjb250YWluZXJXaWR0aCB9O1xuICAgIH0sXG5cbiAgICBfbWFzb25yeUhvcml6b250YWxSZXNpemVDaGFuZ2VkIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2hlY2tJZlNlZ21lbnRzQ2hhbmdlZCh0cnVlKTtcbiAgICB9LFxuXG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PT09IGZpdENvbHVtbnMgPT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX2ZpdENvbHVtbnNSZXNldCA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5maXRDb2x1bW5zID0ge1xuICAgICAgICB4IDogMCxcbiAgICAgICAgeSA6IDAsXG4gICAgICAgIHdpZHRoIDogMFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgX2ZpdENvbHVtbnNMYXlvdXQgOiBmdW5jdGlvbiggJGVsZW1zICkge1xuICAgICAgdmFyIGluc3RhbmNlID0gdGhpcyxcbiAgICAgICAgICBjb250YWluZXJIZWlnaHQgPSB0aGlzLmVsZW1lbnQuaGVpZ2h0KCksXG4gICAgICAgICAgcHJvcHMgPSB0aGlzLmZpdENvbHVtbnM7XG4gICAgICAkZWxlbXMuZWFjaCggZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXG4gICAgICAgICAgICBhdG9tVyA9ICR0aGlzLm91dGVyV2lkdGgodHJ1ZSksXG4gICAgICAgICAgICBhdG9tSCA9ICR0aGlzLm91dGVySGVpZ2h0KHRydWUpO1xuXG4gICAgICAgIGlmICggcHJvcHMueSAhPT0gMCAmJiBhdG9tSCArIHByb3BzLnkgPiBjb250YWluZXJIZWlnaHQgKSB7XG4gICAgICAgICAgLy8gaWYgdGhpcyBlbGVtZW50IGNhbm5vdCBmaXQgaW4gdGhlIGN1cnJlbnQgY29sdW1uXG4gICAgICAgICAgcHJvcHMueCA9IHByb3BzLndpZHRoO1xuICAgICAgICAgIHByb3BzLnkgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcG9zaXRpb24gdGhlIGF0b21cbiAgICAgICAgaW5zdGFuY2UuX3B1c2hQb3NpdGlvbiggJHRoaXMsIHByb3BzLngsIHByb3BzLnkgKTtcblxuICAgICAgICBwcm9wcy53aWR0aCA9IE1hdGgubWF4KCBwcm9wcy54ICsgYXRvbVcsIHByb3BzLndpZHRoICk7XG4gICAgICAgIHByb3BzLnkgKz0gYXRvbUg7XG5cbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfZml0Q29sdW1uc0dldENvbnRhaW5lclNpemUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4geyB3aWR0aCA6IHRoaXMuZml0Q29sdW1ucy53aWR0aCB9O1xuICAgIH0sXG5cbiAgICBfZml0Q29sdW1uc1Jlc2l6ZUNoYW5nZWQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cblxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT09PSBjZWxsc0J5Q29sdW1uID09PT09PT09PT09PT09PT09PT09PT1cblxuICAgIF9jZWxsc0J5Q29sdW1uUmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2VsbHNCeUNvbHVtbiA9IHtcbiAgICAgICAgaW5kZXggOiAwXG4gICAgICB9O1xuICAgICAgLy8gZ2V0IHRoaXMuY2VsbHNCeUNvbHVtbi5jb2x1bW5XaWR0aFxuICAgICAgdGhpcy5fZ2V0U2VnbWVudHMoKTtcbiAgICAgIC8vIGdldCB0aGlzLmNlbGxzQnlDb2x1bW4ucm93SGVpZ2h0XG4gICAgICB0aGlzLl9nZXRTZWdtZW50cyh0cnVlKTtcbiAgICB9LFxuXG4gICAgX2NlbGxzQnlDb2x1bW5MYXlvdXQgOiBmdW5jdGlvbiggJGVsZW1zICkge1xuICAgICAgdmFyIGluc3RhbmNlID0gdGhpcyxcbiAgICAgICAgICBwcm9wcyA9IHRoaXMuY2VsbHNCeUNvbHVtbjtcbiAgICAgICRlbGVtcy5lYWNoKCBmdW5jdGlvbigpe1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxuICAgICAgICAgICAgY29sID0gTWF0aC5mbG9vciggcHJvcHMuaW5kZXggLyBwcm9wcy5yb3dzICksXG4gICAgICAgICAgICByb3cgPSBwcm9wcy5pbmRleCAlIHByb3BzLnJvd3MsXG4gICAgICAgICAgICB4ID0gKCBjb2wgKyAwLjUgKSAqIHByb3BzLmNvbHVtbldpZHRoIC0gJHRoaXMub3V0ZXJXaWR0aCh0cnVlKSAvIDIsXG4gICAgICAgICAgICB5ID0gKCByb3cgKyAwLjUgKSAqIHByb3BzLnJvd0hlaWdodCAtICR0aGlzLm91dGVySGVpZ2h0KHRydWUpIC8gMjtcbiAgICAgICAgaW5zdGFuY2UuX3B1c2hQb3NpdGlvbiggJHRoaXMsIHgsIHkgKTtcbiAgICAgICAgcHJvcHMuaW5kZXggKys7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX2NlbGxzQnlDb2x1bW5HZXRDb250YWluZXJTaXplIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geyB3aWR0aCA6IE1hdGguY2VpbCggdGhpcy4kZmlsdGVyZWRBdG9tcy5sZW5ndGggLyB0aGlzLmNlbGxzQnlDb2x1bW4ucm93cyApICogdGhpcy5jZWxsc0J5Q29sdW1uLmNvbHVtbldpZHRoIH07XG4gICAgfSxcblxuICAgIF9jZWxsc0J5Q29sdW1uUmVzaXplQ2hhbmdlZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NoZWNrSWZTZWdtZW50c0NoYW5nZWQodHJ1ZSk7XG4gICAgfSxcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09PT0gc3RyYWlnaHRBY3Jvc3MgPT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgX3N0cmFpZ2h0QWNyb3NzUmVzZXQgOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3RyYWlnaHRBY3Jvc3MgPSB7XG4gICAgICAgIHggOiAwXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICBfc3RyYWlnaHRBY3Jvc3NMYXlvdXQgOiBmdW5jdGlvbiggJGVsZW1zICkge1xuICAgICAgdmFyIGluc3RhbmNlID0gdGhpcztcbiAgICAgICRlbGVtcy5lYWNoKCBmdW5jdGlvbiggaSApe1xuICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICBpbnN0YW5jZS5fcHVzaFBvc2l0aW9uKCAkdGhpcywgaW5zdGFuY2Uuc3RyYWlnaHRBY3Jvc3MueCwgMCApO1xuICAgICAgICBpbnN0YW5jZS5zdHJhaWdodEFjcm9zcy54ICs9ICR0aGlzLm91dGVyV2lkdGgodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgX3N0cmFpZ2h0QWNyb3NzR2V0Q29udGFpbmVyU2l6ZSA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHsgd2lkdGggOiB0aGlzLnN0cmFpZ2h0QWNyb3NzLnggfTtcbiAgICB9LFxuXG4gICAgX3N0cmFpZ2h0QWNyb3NzUmVzaXplQ2hhbmdlZCA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gIH07XG5cblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PSBpbWFnZXNMb2FkZWQgUGx1Z2luID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgLyohXG4gICAqIGpRdWVyeSBpbWFnZXNMb2FkZWQgcGx1Z2luIHYxLjEuMFxuICAgKiBodHRwOi8vZ2l0aHViLmNvbS9kZXNhbmRyby9pbWFnZXNsb2FkZWRcbiAgICpcbiAgICogTUlUIExpY2Vuc2UuIGJ5IFBhdWwgSXJpc2ggZXQgYWwuXG4gICAqL1xuXG5cbiAgLy8gJCgnI215LWNvbnRhaW5lcicpLmltYWdlc0xvYWRlZChteUZ1bmN0aW9uKVxuICAvLyBvclxuICAvLyAkKCdpbWcnKS5pbWFnZXNMb2FkZWQobXlGdW5jdGlvbilcblxuICAvLyBleGVjdXRlIGEgY2FsbGJhY2sgd2hlbiBhbGwgaW1hZ2VzIGhhdmUgbG9hZGVkLlxuICAvLyBuZWVkZWQgYmVjYXVzZSAubG9hZCgpIGRvZXNuJ3Qgd29yayBvbiBjYWNoZWQgaW1hZ2VzXG5cbiAgLy8gY2FsbGJhY2sgZnVuY3Rpb24gZ2V0cyBpbWFnZSBjb2xsZWN0aW9uIGFzIGFyZ3VtZW50XG4gIC8vICBgdGhpc2AgaXMgdGhlIGNvbnRhaW5lclxuXG4gICQuZm4uaW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuICAgIHZhciAkdGhpcyA9IHRoaXMsXG4gICAgICAgICRpbWFnZXMgPSAkdGhpcy5maW5kKCdpbWcnKS5hZGQoICR0aGlzLmZpbHRlcignaW1nJykgKSxcbiAgICAgICAgbGVuID0gJGltYWdlcy5sZW5ndGgsXG4gICAgICAgIGJsYW5rID0gJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCxSMGxHT0RsaEFRQUJBSUFBQUFBQUFQLy8veXdBQUFBQUFRQUJBQUFDQVV3QU93PT0nLFxuICAgICAgICBsb2FkZWQgPSBbXTtcblxuICAgIGZ1bmN0aW9uIHRyaWdnZXJDYWxsYmFjaygpIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwoICR0aGlzLCAkaW1hZ2VzICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW1nTG9hZGVkKCBldmVudCApIHtcbiAgICAgIHZhciBpbWcgPSBldmVudC50YXJnZXQ7XG4gICAgICBpZiAoIGltZy5zcmMgIT09IGJsYW5rICYmICQuaW5BcnJheSggaW1nLCBsb2FkZWQgKSA9PT0gLTEgKXtcbiAgICAgICAgbG9hZGVkLnB1c2goIGltZyApO1xuICAgICAgICBpZiAoIC0tbGVuIDw9IDAgKXtcbiAgICAgICAgICBzZXRUaW1lb3V0KCB0cmlnZ2VyQ2FsbGJhY2sgKTtcbiAgICAgICAgICAkaW1hZ2VzLnVuYmluZCggJy5pbWFnZXNMb2FkZWQnLCBpbWdMb2FkZWQgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIG5vIGltYWdlcywgdHJpZ2dlciBpbW1lZGlhdGVseVxuICAgIGlmICggIWxlbiApIHtcbiAgICAgIHRyaWdnZXJDYWxsYmFjaygpO1xuICAgIH1cblxuICAgICRpbWFnZXMuYmluZCggJ2xvYWQuaW1hZ2VzTG9hZGVkIGVycm9yLmltYWdlc0xvYWRlZCcsICBpbWdMb2FkZWQgKS5lYWNoKCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGNhY2hlZCBpbWFnZXMgZG9uJ3QgZmlyZSBsb2FkIHNvbWV0aW1lcywgc28gd2UgcmVzZXQgc3JjLlxuICAgICAgdmFyIHNyYyA9IHRoaXMuc3JjO1xuICAgICAgLy8gd2Via2l0IGhhY2sgZnJvbSBodHRwOi8vZ3JvdXBzLmdvb2dsZS5jb20vZ3JvdXAvanF1ZXJ5LWRldi9icm93c2VfdGhyZWFkL3RocmVhZC9lZWU2YWI3YjJkYTUwZTFmXG4gICAgICAvLyBkYXRhIHVyaSBieXBhc3NlcyB3ZWJraXQgbG9nIHdhcm5pbmcgKHRoeCBkb3VnIGpvbmVzKVxuICAgICAgdGhpcy5zcmMgPSBibGFuaztcbiAgICAgIHRoaXMuc3JjID0gc3JjO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuICR0aGlzO1xuICB9O1xuXG5cbiAgLy8gaGVscGVyIGZ1bmN0aW9uIGZvciBsb2dnaW5nIGVycm9yc1xuICAvLyAkLmVycm9yIGJyZWFrcyBqUXVlcnkgY2hhaW5pbmdcbiAgdmFyIGxvZ0Vycm9yID0gZnVuY3Rpb24oIG1lc3NhZ2UgKSB7XG4gICAgaWYgKCB3aW5kb3cuY29uc29sZSApIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlLmVycm9yKCBtZXNzYWdlICk7XG4gICAgfVxuICB9O1xuXG4gIC8vID09PT09PT09PT09PT09PT09PT09PT09ICBQbHVnaW4gYnJpZGdlICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIC8vIGxldmVyYWdlcyBkYXRhIG1ldGhvZCB0byBlaXRoZXIgY3JlYXRlIG9yIHJldHVybiAkLklzb3RvcGUgY29uc3RydWN0b3JcbiAgLy8gQSBiaXQgZnJvbSBqUXVlcnkgVUlcbiAgLy8gICBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS11aS9ibG9iL21hc3Rlci91aS9qcXVlcnkudWkud2lkZ2V0LmpzXG4gIC8vIEEgYml0IGZyb20gamNhcm91c2VsXG4gIC8vICAgaHR0cHM6Ly9naXRodWIuY29tL2pzb3IvamNhcm91c2VsL2Jsb2IvbWFzdGVyL2xpYi9qcXVlcnkuamNhcm91c2VsLmpzXG5cbiAgJC5mbi5pc290b3BlID0gZnVuY3Rpb24oIG9wdGlvbnMsIGNhbGxiYWNrICkge1xuICAgIGlmICggdHlwZW9mIG9wdGlvbnMgPT09ICdzdHJpbmcnICkge1xuICAgICAgLy8gY2FsbCBtZXRob2RcbiAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApO1xuXG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gJC5kYXRhKCB0aGlzLCAnaXNvdG9wZScgKTtcbiAgICAgICAgaWYgKCAhaW5zdGFuY2UgKSB7XG4gICAgICAgICAgbG9nRXJyb3IoIFwiY2Fubm90IGNhbGwgbWV0aG9kcyBvbiBpc290b3BlIHByaW9yIHRvIGluaXRpYWxpemF0aW9uOyBcIiArXG4gICAgICAgICAgICAgIFwiYXR0ZW1wdGVkIHRvIGNhbGwgbWV0aG9kICdcIiArIG9wdGlvbnMgKyBcIidcIiApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoICEkLmlzRnVuY3Rpb24oIGluc3RhbmNlW29wdGlvbnNdICkgfHwgb3B0aW9ucy5jaGFyQXQoMCkgPT09IFwiX1wiICkge1xuICAgICAgICAgIGxvZ0Vycm9yKCBcIm5vIHN1Y2ggbWV0aG9kICdcIiArIG9wdGlvbnMgKyBcIicgZm9yIGlzb3RvcGUgaW5zdGFuY2VcIiApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBhcHBseSBtZXRob2RcbiAgICAgICAgaW5zdGFuY2VbIG9wdGlvbnMgXS5hcHBseSggaW5zdGFuY2UsIGFyZ3MgKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9ICQuZGF0YSggdGhpcywgJ2lzb3RvcGUnICk7XG4gICAgICAgIGlmICggaW5zdGFuY2UgKSB7XG4gICAgICAgICAgLy8gYXBwbHkgb3B0aW9ucyAmIGluaXRcbiAgICAgICAgICBpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICAgICAgICBpbnN0YW5jZS5faW5pdCggY2FsbGJhY2sgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBpbml0aWFsaXplIG5ldyBpbnN0YW5jZVxuICAgICAgICAgICQuZGF0YSggdGhpcywgJ2lzb3RvcGUnLCBuZXcgJC5Jc290b3BlKCBvcHRpb25zLCB0aGlzLCBjYWxsYmFjayApICk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyByZXR1cm4galF1ZXJ5IG9iamVjdFxuICAgIC8vIHNvIHBsdWdpbiBtZXRob2RzIGRvIG5vdCBoYXZlIHRvXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbn0pKCB3aW5kb3csIGpRdWVyeSApOyIsIi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRDbGFzczogcHJldHR5UGhvdG9cblx0VXNlOiBMaWdodGJveCBjbG9uZSBmb3IgalF1ZXJ5XG5cdEF1dGhvcjogU3RlcGhhbmUgQ2Fyb24gKGh0dHA6Ly93d3cubm8tbWFyZ2luLWZvci1lcnJvcnMuY29tKVxuXHRWZXJzaW9uOiAzLjEuNVxuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xuKGZ1bmN0aW9uKGUpe2Z1bmN0aW9uIHQoKXt2YXIgZT1sb2NhdGlvbi5ocmVmO2hhc2h0YWc9ZS5pbmRleE9mKFwiI3ByZXR0eVBob3RvXCIpIT09LTE/ZGVjb2RlVVJJKGUuc3Vic3RyaW5nKGUuaW5kZXhPZihcIiNwcmV0dHlQaG90b1wiKSsxLGUubGVuZ3RoKSk6ZmFsc2U7cmV0dXJuIGhhc2h0YWd9ZnVuY3Rpb24gbigpe2lmKHR5cGVvZiB0aGVSZWw9PVwidW5kZWZpbmVkXCIpcmV0dXJuO2xvY2F0aW9uLmhhc2g9dGhlUmVsK1wiL1wiK3JlbF9pbmRleCtcIi9cIn1mdW5jdGlvbiByKCl7aWYobG9jYXRpb24uaHJlZi5pbmRleE9mKFwiI3ByZXR0eVBob3RvXCIpIT09LTEpbG9jYXRpb24uaGFzaD1cInByZXR0eVBob3RvXCJ9ZnVuY3Rpb24gaShlLHQpe2U9ZS5yZXBsYWNlKC9bXFxbXS8sXCJcXFxcW1wiKS5yZXBsYWNlKC9bXFxdXS8sXCJcXFxcXVwiKTt2YXIgbj1cIltcXFxcPyZdXCIrZStcIj0oW14mI10qKVwiO3ZhciByPW5ldyBSZWdFeHAobik7dmFyIGk9ci5leGVjKHQpO3JldHVybiBpPT1udWxsP1wiXCI6aVsxXX1lLnByZXR0eVBob3RvPXt2ZXJzaW9uOlwiMy4xLjVcIn07ZS5mbi5wcmV0dHlQaG90bz1mdW5jdGlvbihzKXtmdW5jdGlvbiBnKCl7ZShcIi5wcF9sb2FkZXJJY29uXCIpLmhpZGUoKTtwcm9qZWN0ZWRUb3A9c2Nyb2xsX3Bvc1tcInNjcm9sbFRvcFwiXSsoZC8yLWFbXCJjb250YWluZXJIZWlnaHRcIl0vMik7aWYocHJvamVjdGVkVG9wPDApcHJvamVjdGVkVG9wPTA7JHBwdC5mYWRlVG8oc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkLDEpOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfY29udGVudFwiKS5hbmltYXRlKHtoZWlnaHQ6YVtcImNvbnRlbnRIZWlnaHRcIl0sd2lkdGg6YVtcImNvbnRlbnRXaWR0aFwiXX0sc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkKTskcHBfcGljX2hvbGRlci5hbmltYXRlKHt0b3A6cHJvamVjdGVkVG9wLGxlZnQ6di8yLWFbXCJjb250YWluZXJXaWR0aFwiXS8yPDA/MDp2LzItYVtcImNvbnRhaW5lcldpZHRoXCJdLzIsd2lkdGg6YVtcImNvbnRhaW5lcldpZHRoXCJdfSxzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQsZnVuY3Rpb24oKXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2hvdmVyQ29udGFpbmVyLCNmdWxsUmVzSW1hZ2VcIikuaGVpZ2h0KGFbXCJoZWlnaHRcIl0pLndpZHRoKGFbXCJ3aWR0aFwiXSk7JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9mYWRlXCIpLmZhZGVJbihzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQpO2lmKGlzU2V0JiZTKHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dKT09XCJpbWFnZVwiKXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2hvdmVyQ29udGFpbmVyXCIpLnNob3coKX1lbHNleyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfaG92ZXJDb250YWluZXJcIikuaGlkZSgpfWlmKHNldHRpbmdzLmFsbG93X2V4cGFuZCl7aWYoYVtcInJlc2l6ZWRcIl0pe2UoXCJhLnBwX2V4cGFuZCxhLnBwX2NvbnRyYWN0XCIpLnNob3coKX1lbHNle2UoXCJhLnBwX2V4cGFuZFwiKS5oaWRlKCl9fWlmKHNldHRpbmdzLmF1dG9wbGF5X3NsaWRlc2hvdyYmIW0mJiFmKWUucHJldHR5UGhvdG8uc3RhcnRTbGlkZXNob3coKTtzZXR0aW5ncy5jaGFuZ2VwaWN0dXJlY2FsbGJhY2soKTtmPXRydWV9KTtDKCk7cy5hamF4Y2FsbGJhY2soKX1mdW5jdGlvbiB5KHQpeyRwcF9waWNfaG9sZGVyLmZpbmQoXCIjcHBfZnVsbF9yZXMgb2JqZWN0LCNwcF9mdWxsX3JlcyBlbWJlZFwiKS5jc3MoXCJ2aXNpYmlsaXR5XCIsXCJoaWRkZW5cIik7JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9mYWRlXCIpLmZhZGVPdXQoc2V0dGluZ3MuYW5pbWF0aW9uX3NwZWVkLGZ1bmN0aW9uKCl7ZShcIi5wcF9sb2FkZXJJY29uXCIpLnNob3coKTt0KCl9KX1mdW5jdGlvbiBiKHQpe3Q+MT9lKFwiLnBwX25hdlwiKS5zaG93KCk6ZShcIi5wcF9uYXZcIikuaGlkZSgpfWZ1bmN0aW9uIHcoZSx0KXtyZXNpemVkPWZhbHNlO0UoZSx0KTtpbWFnZVdpZHRoPWUsaW1hZ2VIZWlnaHQ9dDtpZigocD52fHxoPmQpJiZkb3Jlc2l6ZSYmc2V0dGluZ3MuYWxsb3dfcmVzaXplJiYhdSl7cmVzaXplZD10cnVlLGZpdHRpbmc9ZmFsc2U7d2hpbGUoIWZpdHRpbmcpe2lmKHA+dil7aW1hZ2VXaWR0aD12LTIwMDtpbWFnZUhlaWdodD10L2UqaW1hZ2VXaWR0aH1lbHNlIGlmKGg+ZCl7aW1hZ2VIZWlnaHQ9ZC0yMDA7aW1hZ2VXaWR0aD1lL3QqaW1hZ2VIZWlnaHR9ZWxzZXtmaXR0aW5nPXRydWV9aD1pbWFnZUhlaWdodCxwPWltYWdlV2lkdGh9aWYocD52fHxoPmQpe3cocCxoKX1FKGltYWdlV2lkdGgsaW1hZ2VIZWlnaHQpfXJldHVybnt3aWR0aDpNYXRoLmZsb29yKGltYWdlV2lkdGgpLGhlaWdodDpNYXRoLmZsb29yKGltYWdlSGVpZ2h0KSxjb250YWluZXJIZWlnaHQ6TWF0aC5mbG9vcihoKSxjb250YWluZXJXaWR0aDpNYXRoLmZsb29yKHApK3NldHRpbmdzLmhvcml6b250YWxfcGFkZGluZyoyLGNvbnRlbnRIZWlnaHQ6TWF0aC5mbG9vcihsKSxjb250ZW50V2lkdGg6TWF0aC5mbG9vcihjKSxyZXNpemVkOnJlc2l6ZWR9fWZ1bmN0aW9uIEUodCxuKXt0PXBhcnNlRmxvYXQodCk7bj1wYXJzZUZsb2F0KG4pOyRwcF9kZXRhaWxzPSRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfZGV0YWlsc1wiKTskcHBfZGV0YWlscy53aWR0aCh0KTtkZXRhaWxzSGVpZ2h0PXBhcnNlRmxvYXQoJHBwX2RldGFpbHMuY3NzKFwibWFyZ2luVG9wXCIpKStwYXJzZUZsb2F0KCRwcF9kZXRhaWxzLmNzcyhcIm1hcmdpbkJvdHRvbVwiKSk7JHBwX2RldGFpbHM9JHBwX2RldGFpbHMuY2xvbmUoKS5hZGRDbGFzcyhzZXR0aW5ncy50aGVtZSkud2lkdGgodCkuYXBwZW5kVG8oZShcImJvZHlcIikpLmNzcyh7cG9zaXRpb246XCJhYnNvbHV0ZVwiLHRvcDotMWU0fSk7ZGV0YWlsc0hlaWdodCs9JHBwX2RldGFpbHMuaGVpZ2h0KCk7ZGV0YWlsc0hlaWdodD1kZXRhaWxzSGVpZ2h0PD0zND8zNjpkZXRhaWxzSGVpZ2h0OyRwcF9kZXRhaWxzLnJlbW92ZSgpOyRwcF90aXRsZT0kcHBfcGljX2hvbGRlci5maW5kKFwiLnBwdFwiKTskcHBfdGl0bGUud2lkdGgodCk7dGl0bGVIZWlnaHQ9cGFyc2VGbG9hdCgkcHBfdGl0bGUuY3NzKFwibWFyZ2luVG9wXCIpKStwYXJzZUZsb2F0KCRwcF90aXRsZS5jc3MoXCJtYXJnaW5Cb3R0b21cIikpOyRwcF90aXRsZT0kcHBfdGl0bGUuY2xvbmUoKS5hcHBlbmRUbyhlKFwiYm9keVwiKSkuY3NzKHtwb3NpdGlvbjpcImFic29sdXRlXCIsdG9wOi0xZTR9KTt0aXRsZUhlaWdodCs9JHBwX3RpdGxlLmhlaWdodCgpOyRwcF90aXRsZS5yZW1vdmUoKTtsPW4rZGV0YWlsc0hlaWdodDtjPXQ7aD1sK3RpdGxlSGVpZ2h0KyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfdG9wXCIpLmhlaWdodCgpKyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfYm90dG9tXCIpLmhlaWdodCgpO3A9dH1mdW5jdGlvbiBTKGUpe2lmKGUubWF0Y2goL3lvdXR1YmVcXC5jb21cXC93YXRjaC9pKXx8ZS5tYXRjaCgveW91dHVcXC5iZS9pKSl7cmV0dXJuXCJ5b3V0dWJlXCJ9ZWxzZSBpZihlLm1hdGNoKC92aW1lb1xcLmNvbS9pKSl7cmV0dXJuXCJ2aW1lb1wifWVsc2UgaWYoZS5tYXRjaCgvXFxiLm1vdlxcYi9pKSl7cmV0dXJuXCJxdWlja3RpbWVcIn1lbHNlIGlmKGUubWF0Y2goL1xcYi5zd2ZcXGIvaSkpe3JldHVyblwiZmxhc2hcIn1lbHNlIGlmKGUubWF0Y2goL1xcYmlmcmFtZT10cnVlXFxiL2kpKXtyZXR1cm5cImlmcmFtZVwifWVsc2UgaWYoZS5tYXRjaCgvXFxiYWpheD10cnVlXFxiL2kpKXtyZXR1cm5cImFqYXhcIn1lbHNlIGlmKGUubWF0Y2goL1xcYmN1c3RvbT10cnVlXFxiL2kpKXtyZXR1cm5cImN1c3RvbVwifWVsc2UgaWYoZS5zdWJzdHIoMCwxKT09XCIjXCIpe3JldHVyblwiaW5saW5lXCJ9ZWxzZXtyZXR1cm5cImltYWdlXCJ9fWZ1bmN0aW9uIHgoKXtpZihkb3Jlc2l6ZSYmdHlwZW9mICRwcF9waWNfaG9sZGVyIT1cInVuZGVmaW5lZFwiKXtzY3JvbGxfcG9zPVQoKTtjb250ZW50SGVpZ2h0PSRwcF9waWNfaG9sZGVyLmhlaWdodCgpLGNvbnRlbnR3aWR0aD0kcHBfcGljX2hvbGRlci53aWR0aCgpO3Byb2plY3RlZFRvcD1kLzIrc2Nyb2xsX3Bvc1tcInNjcm9sbFRvcFwiXS1jb250ZW50SGVpZ2h0LzI7aWYocHJvamVjdGVkVG9wPDApcHJvamVjdGVkVG9wPTA7aWYoY29udGVudEhlaWdodD5kKXJldHVybjskcHBfcGljX2hvbGRlci5jc3Moe3RvcDpwcm9qZWN0ZWRUb3AsbGVmdDp2LzIrc2Nyb2xsX3Bvc1tcInNjcm9sbExlZnRcIl0tY29udGVudHdpZHRoLzJ9KX19ZnVuY3Rpb24gVCgpe2lmKHNlbGYucGFnZVlPZmZzZXQpe3JldHVybntzY3JvbGxUb3A6c2VsZi5wYWdlWU9mZnNldCxzY3JvbGxMZWZ0OnNlbGYucGFnZVhPZmZzZXR9fWVsc2UgaWYoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50JiZkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKXtyZXR1cm57c2Nyb2xsVG9wOmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3Asc2Nyb2xsTGVmdDpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdH19ZWxzZSBpZihkb2N1bWVudC5ib2R5KXtyZXR1cm57c2Nyb2xsVG9wOmRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wLHNjcm9sbExlZnQ6ZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0fX19ZnVuY3Rpb24gTigpe2Q9ZSh3aW5kb3cpLmhlaWdodCgpLHY9ZSh3aW5kb3cpLndpZHRoKCk7aWYodHlwZW9mICRwcF9vdmVybGF5IT1cInVuZGVmaW5lZFwiKSRwcF9vdmVybGF5LmhlaWdodChlKGRvY3VtZW50KS5oZWlnaHQoKSkud2lkdGgodil9ZnVuY3Rpb24gQygpe2lmKGlzU2V0JiZzZXR0aW5ncy5vdmVybGF5X2dhbGxlcnkmJlMocHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pPT1cImltYWdlXCIpe2l0ZW1XaWR0aD01Mis1O25hdldpZHRoPXNldHRpbmdzLnRoZW1lPT1cImZhY2Vib29rXCJ8fHNldHRpbmdzLnRoZW1lPT1cInBwX2RlZmF1bHRcIj81MDozMDtpdGVtc1BlclBhZ2U9TWF0aC5mbG9vcigoYVtcImNvbnRhaW5lcldpZHRoXCJdLTEwMC1uYXZXaWR0aCkvaXRlbVdpZHRoKTtpdGVtc1BlclBhZ2U9aXRlbXNQZXJQYWdlPHBwX2ltYWdlcy5sZW5ndGg/aXRlbXNQZXJQYWdlOnBwX2ltYWdlcy5sZW5ndGg7dG90YWxQYWdlPU1hdGguY2VpbChwcF9pbWFnZXMubGVuZ3RoL2l0ZW1zUGVyUGFnZSktMTtpZih0b3RhbFBhZ2U9PTApe25hdldpZHRoPTA7JHBwX2dhbGxlcnkuZmluZChcIi5wcF9hcnJvd19uZXh0LC5wcF9hcnJvd19wcmV2aW91c1wiKS5oaWRlKCl9ZWxzZXskcHBfZ2FsbGVyeS5maW5kKFwiLnBwX2Fycm93X25leHQsLnBwX2Fycm93X3ByZXZpb3VzXCIpLnNob3coKX1nYWxsZXJ5V2lkdGg9aXRlbXNQZXJQYWdlKml0ZW1XaWR0aDtmdWxsR2FsbGVyeVdpZHRoPXBwX2ltYWdlcy5sZW5ndGgqaXRlbVdpZHRoOyRwcF9nYWxsZXJ5LmNzcyhcIm1hcmdpbi1sZWZ0XCIsLShnYWxsZXJ5V2lkdGgvMituYXZXaWR0aC8yKSkuZmluZChcImRpdjpmaXJzdFwiKS53aWR0aChnYWxsZXJ5V2lkdGgrNSkuZmluZChcInVsXCIpLndpZHRoKGZ1bGxHYWxsZXJ5V2lkdGgpLmZpbmQoXCJsaS5zZWxlY3RlZFwiKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkXCIpO2dvVG9QYWdlPU1hdGguZmxvb3Ioc2V0X3Bvc2l0aW9uL2l0ZW1zUGVyUGFnZSk8dG90YWxQYWdlP01hdGguZmxvb3Ioc2V0X3Bvc2l0aW9uL2l0ZW1zUGVyUGFnZSk6dG90YWxQYWdlO2UucHJldHR5UGhvdG8uY2hhbmdlR2FsbGVyeVBhZ2UoZ29Ub1BhZ2UpOyRwcF9nYWxsZXJ5X2xpLmZpbHRlcihcIjplcShcIitzZXRfcG9zaXRpb24rXCIpXCIpLmFkZENsYXNzKFwic2VsZWN0ZWRcIil9ZWxzZXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2NvbnRlbnRcIikudW5iaW5kKFwibW91c2VlbnRlciBtb3VzZWxlYXZlXCIpfX1mdW5jdGlvbiBrKHQpe2lmKHNldHRpbmdzLnNvY2lhbF90b29scylmYWNlYm9va19saWtlX2xpbms9c2V0dGluZ3Muc29jaWFsX3Rvb2xzLnJlcGxhY2UoXCJ7bG9jYXRpb25faHJlZn1cIixlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24uaHJlZikpO3NldHRpbmdzLm1hcmt1cD1zZXR0aW5ncy5tYXJrdXAucmVwbGFjZShcIntwcF9zb2NpYWx9XCIsXCJcIik7ZShcImJvZHlcIikuYXBwZW5kKHNldHRpbmdzLm1hcmt1cCk7JHBwX3BpY19ob2xkZXI9ZShcIi5wcF9waWNfaG9sZGVyXCIpLCRwcHQ9ZShcIi5wcHRcIiksJHBwX292ZXJsYXk9ZShcImRpdi5wcF9vdmVybGF5XCIpO2lmKGlzU2V0JiZzZXR0aW5ncy5vdmVybGF5X2dhbGxlcnkpe2N1cnJlbnRHYWxsZXJ5UGFnZT0wO3RvSW5qZWN0PVwiXCI7Zm9yKHZhciBuPTA7bjxwcF9pbWFnZXMubGVuZ3RoO24rKyl7aWYoIXBwX2ltYWdlc1tuXS5tYXRjaCgvXFxiKGpwZ3xqcGVnfHBuZ3xnaWYpXFxiL2dpKSl7Y2xhc3NuYW1lPVwiZGVmYXVsdFwiO2ltZ19zcmM9XCJcIn1lbHNle2NsYXNzbmFtZT1cIlwiO2ltZ19zcmM9cHBfaW1hZ2VzW25dfXRvSW5qZWN0Kz1cIjxsaSBjbGFzcz0nXCIrY2xhc3NuYW1lK1wiJz48YSBocmVmPScjJz48aW1nIHNyYz0nXCIraW1nX3NyYytcIicgd2lkdGg9JzUwJyBhbHQ9JycgLz48L2E+PC9saT5cIn10b0luamVjdD1zZXR0aW5ncy5nYWxsZXJ5X21hcmt1cC5yZXBsYWNlKC97Z2FsbGVyeX0vZyx0b0luamVjdCk7JHBwX3BpY19ob2xkZXIuZmluZChcIiNwcF9mdWxsX3Jlc1wiKS5hZnRlcih0b0luamVjdCk7JHBwX2dhbGxlcnk9ZShcIi5wcF9waWNfaG9sZGVyIC5wcF9nYWxsZXJ5XCIpLCRwcF9nYWxsZXJ5X2xpPSRwcF9nYWxsZXJ5LmZpbmQoXCJsaVwiKTskcHBfZ2FsbGVyeS5maW5kKFwiLnBwX2Fycm93X25leHRcIikuY2xpY2soZnVuY3Rpb24oKXtlLnByZXR0eVBob3RvLmNoYW5nZUdhbGxlcnlQYWdlKFwibmV4dFwiKTtlLnByZXR0eVBob3RvLnN0b3BTbGlkZXNob3coKTtyZXR1cm4gZmFsc2V9KTskcHBfZ2FsbGVyeS5maW5kKFwiLnBwX2Fycm93X3ByZXZpb3VzXCIpLmNsaWNrKGZ1bmN0aW9uKCl7ZS5wcmV0dHlQaG90by5jaGFuZ2VHYWxsZXJ5UGFnZShcInByZXZpb3VzXCIpO2UucHJldHR5UGhvdG8uc3RvcFNsaWRlc2hvdygpO3JldHVybiBmYWxzZX0pOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfY29udGVudFwiKS5ob3ZlcihmdW5jdGlvbigpeyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfZ2FsbGVyeTpub3QoLmRpc2FibGVkKVwiKS5mYWRlSW4oKX0sZnVuY3Rpb24oKXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX2dhbGxlcnk6bm90KC5kaXNhYmxlZClcIikuZmFkZU91dCgpfSk7aXRlbVdpZHRoPTUyKzU7JHBwX2dhbGxlcnlfbGkuZWFjaChmdW5jdGlvbih0KXtlKHRoaXMpLmZpbmQoXCJhXCIpLmNsaWNrKGZ1bmN0aW9uKCl7ZS5wcmV0dHlQaG90by5jaGFuZ2VQYWdlKHQpO2UucHJldHR5UGhvdG8uc3RvcFNsaWRlc2hvdygpO3JldHVybiBmYWxzZX0pfSl9aWYoc2V0dGluZ3Muc2xpZGVzaG93KXskcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX25hdlwiKS5wcmVwZW5kKCc8YSBocmVmPVwiI1wiIGNsYXNzPVwicHBfcGxheVwiPlBsYXk8L2E+Jyk7JHBwX3BpY19ob2xkZXIuZmluZChcIi5wcF9uYXYgLnBwX3BsYXlcIikuY2xpY2soZnVuY3Rpb24oKXtlLnByZXR0eVBob3RvLnN0YXJ0U2xpZGVzaG93KCk7cmV0dXJuIGZhbHNlfSl9JHBwX3BpY19ob2xkZXIuYXR0cihcImNsYXNzXCIsXCJwcF9waWNfaG9sZGVyIFwiK3NldHRpbmdzLnRoZW1lKTskcHBfb3ZlcmxheS5jc3Moe29wYWNpdHk6MCxoZWlnaHQ6ZShkb2N1bWVudCkuaGVpZ2h0KCksd2lkdGg6ZSh3aW5kb3cpLndpZHRoKCl9KS5iaW5kKFwiY2xpY2tcIixmdW5jdGlvbigpe2lmKCFzZXR0aW5ncy5tb2RhbCllLnByZXR0eVBob3RvLmNsb3NlKCl9KTtlKFwiYS5wcF9jbG9zZVwiKS5iaW5kKFwiY2xpY2tcIixmdW5jdGlvbigpe2UucHJldHR5UGhvdG8uY2xvc2UoKTtyZXR1cm4gZmFsc2V9KTtpZihzZXR0aW5ncy5hbGxvd19leHBhbmQpe2UoXCJhLnBwX2V4cGFuZFwiKS5iaW5kKFwiY2xpY2tcIixmdW5jdGlvbih0KXtpZihlKHRoaXMpLmhhc0NsYXNzKFwicHBfZXhwYW5kXCIpKXtlKHRoaXMpLnJlbW92ZUNsYXNzKFwicHBfZXhwYW5kXCIpLmFkZENsYXNzKFwicHBfY29udHJhY3RcIik7ZG9yZXNpemU9ZmFsc2V9ZWxzZXtlKHRoaXMpLnJlbW92ZUNsYXNzKFwicHBfY29udHJhY3RcIikuYWRkQ2xhc3MoXCJwcF9leHBhbmRcIik7ZG9yZXNpemU9dHJ1ZX15KGZ1bmN0aW9uKCl7ZS5wcmV0dHlQaG90by5vcGVuKCl9KTtyZXR1cm4gZmFsc2V9KX0kcHBfcGljX2hvbGRlci5maW5kKFwiLnBwX3ByZXZpb3VzLCAucHBfbmF2IC5wcF9hcnJvd19wcmV2aW91c1wiKS5iaW5kKFwiY2xpY2tcIixmdW5jdGlvbigpe2UucHJldHR5UGhvdG8uY2hhbmdlUGFnZShcInByZXZpb3VzXCIpO2UucHJldHR5UGhvdG8uc3RvcFNsaWRlc2hvdygpO3JldHVybiBmYWxzZX0pOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfbmV4dCwgLnBwX25hdiAucHBfYXJyb3dfbmV4dFwiKS5iaW5kKFwiY2xpY2tcIixmdW5jdGlvbigpe2UucHJldHR5UGhvdG8uY2hhbmdlUGFnZShcIm5leHRcIik7ZS5wcmV0dHlQaG90by5zdG9wU2xpZGVzaG93KCk7cmV0dXJuIGZhbHNlfSk7eCgpfXM9alF1ZXJ5LmV4dGVuZCh7aG9vazpcInJlbFwiLGFuaW1hdGlvbl9zcGVlZDpcImZhc3RcIixhamF4Y2FsbGJhY2s6ZnVuY3Rpb24oKXt9LHNsaWRlc2hvdzo1ZTMsYXV0b3BsYXlfc2xpZGVzaG93OmZhbHNlLG9wYWNpdHk6Ljgsc2hvd190aXRsZTp0cnVlLGFsbG93X3Jlc2l6ZTp0cnVlLGFsbG93X2V4cGFuZDp0cnVlLGRlZmF1bHRfd2lkdGg6NTAwLGRlZmF1bHRfaGVpZ2h0OjM0NCxjb3VudGVyX3NlcGFyYXRvcl9sYWJlbDpcIi9cIix0aGVtZTpcInBwX2RlZmF1bHRcIixob3Jpem9udGFsX3BhZGRpbmc6MjAsaGlkZWZsYXNoOmZhbHNlLHdtb2RlOlwib3BhcXVlXCIsYXV0b3BsYXk6dHJ1ZSxtb2RhbDpmYWxzZSxkZWVwbGlua2luZzp0cnVlLG92ZXJsYXlfZ2FsbGVyeTp0cnVlLG92ZXJsYXlfZ2FsbGVyeV9tYXg6MzAsa2V5Ym9hcmRfc2hvcnRjdXRzOnRydWUsY2hhbmdlcGljdHVyZWNhbGxiYWNrOmZ1bmN0aW9uKCl7fSxjYWxsYmFjazpmdW5jdGlvbigpe30saWU2X2ZhbGxiYWNrOnRydWUsbWFya3VwOic8ZGl2IGNsYXNzPVwicHBfcGljX2hvbGRlclwiPiBcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHB0XCI+wqA8L2Rpdj4gXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX3RvcFwiPiBcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9sZWZ0XCI+PC9kaXY+IFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX21pZGRsZVwiPjwvZGl2PiBcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9yaWdodFwiPjwvZGl2PiBcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX2NvbnRlbnRfY29udGFpbmVyXCI+IFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX2xlZnRcIj4gXHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfcmlnaHRcIj4gXHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9jb250ZW50XCI+IFx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9sb2FkZXJJY29uXCI+PC9kaXY+IFx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9mYWRlXCI+IFx0XHRcdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj1cIiNcIiBjbGFzcz1cInBwX2V4cGFuZFwiIHRpdGxlPVwiRXhwYW5kIHRoZSBpbWFnZVwiPkV4cGFuZDwvYT4gXHRcdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfaG92ZXJDb250YWluZXJcIj4gXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxhIGNsYXNzPVwicHBfbmV4dFwiIGhyZWY9XCIjXCI+bmV4dDwvYT4gXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxhIGNsYXNzPVwicHBfcHJldmlvdXNcIiBocmVmPVwiI1wiPnByZXZpb3VzPC9hPiBcdFx0XHRcdFx0XHRcdFx0XHRcdDwvZGl2PiBcdFx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgaWQ9XCJwcF9mdWxsX3Jlc1wiPjwvZGl2PiBcdFx0XHRcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9kZXRhaWxzXCI+IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfbmF2XCI+IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJwcF9hcnJvd19wcmV2aW91c1wiPlByZXZpb3VzPC9hPiBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8cCBjbGFzcz1cImN1cnJlbnRUZXh0SG9sZGVyXCI+MC8wPC9wPiBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8YSBocmVmPVwiI1wiIGNsYXNzPVwicHBfYXJyb3dfbmV4dFwiPk5leHQ8L2E+IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxwIGNsYXNzPVwicHBfZGVzY3JpcHRpb25cIj48L3A+IFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8ZGl2IGNsYXNzPVwicHBfc29jaWFsXCI+e3BwX3NvY2lhbH08L2Rpdj4gXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxhIGNsYXNzPVwicHBfY2xvc2VcIiBocmVmPVwiI1wiPkNsb3NlPC9hPiBcdFx0XHRcdFx0XHRcdFx0XHRcdDwvZGl2PiBcdFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0XHRcdDwvZGl2PiBcdFx0XHRcdFx0XHRcdDwvZGl2PiBcdFx0XHRcdFx0XHRcdDwvZGl2PiBcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX2JvdHRvbVwiPiBcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9sZWZ0XCI+PC9kaXY+IFx0XHRcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX21pZGRsZVwiPjwvZGl2PiBcdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJwcF9yaWdodFwiPjwvZGl2PiBcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdDwvZGl2PiBcdFx0XHRcdFx0PGRpdiBjbGFzcz1cInBwX292ZXJsYXlcIj48L2Rpdj4nLGdhbGxlcnlfbWFya3VwOic8ZGl2IGNsYXNzPVwicHBfZ2FsbGVyeVwiPiBcdFx0XHRcdFx0XHRcdFx0PGEgaHJlZj1cIiNcIiBjbGFzcz1cInBwX2Fycm93X3ByZXZpb3VzXCI+UHJldmlvdXM8L2E+IFx0XHRcdFx0XHRcdFx0XHQ8ZGl2PiBcdFx0XHRcdFx0XHRcdFx0XHQ8dWw+IFx0XHRcdFx0XHRcdFx0XHRcdFx0e2dhbGxlcnl9IFx0XHRcdFx0XHRcdFx0XHRcdDwvdWw+IFx0XHRcdFx0XHRcdFx0XHQ8L2Rpdj4gXHRcdFx0XHRcdFx0XHRcdDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJwcF9hcnJvd19uZXh0XCI+TmV4dDwvYT4gXHRcdFx0XHRcdFx0XHQ8L2Rpdj4nLGltYWdlX21hcmt1cDonPGltZyBpZD1cImZ1bGxSZXNJbWFnZVwiIHNyYz1cIntwYXRofVwiIC8+JyxmbGFzaF9tYXJrdXA6JzxvYmplY3QgY2xhc3NpZD1cImNsc2lkOkQyN0NEQjZFLUFFNkQtMTFjZi05NkI4LTQ0NDU1MzU0MDAwMFwiIHdpZHRoPVwie3dpZHRofVwiIGhlaWdodD1cIntoZWlnaHR9XCI+PHBhcmFtIG5hbWU9XCJ3bW9kZVwiIHZhbHVlPVwie3dtb2RlfVwiIC8+PHBhcmFtIG5hbWU9XCJhbGxvd2Z1bGxzY3JlZW5cIiB2YWx1ZT1cInRydWVcIiAvPjxwYXJhbSBuYW1lPVwiYWxsb3dzY3JpcHRhY2Nlc3NcIiB2YWx1ZT1cImFsd2F5c1wiIC8+PHBhcmFtIG5hbWU9XCJtb3ZpZVwiIHZhbHVlPVwie3BhdGh9XCIgLz48ZW1iZWQgc3JjPVwie3BhdGh9XCIgdHlwZT1cImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCIgYWxsb3dmdWxsc2NyZWVuPVwidHJ1ZVwiIGFsbG93c2NyaXB0YWNjZXNzPVwiYWx3YXlzXCIgd2lkdGg9XCJ7d2lkdGh9XCIgaGVpZ2h0PVwie2hlaWdodH1cIiB3bW9kZT1cInt3bW9kZX1cIj48L2VtYmVkPjwvb2JqZWN0PicscXVpY2t0aW1lX21hcmt1cDonPG9iamVjdCBjbGFzc2lkPVwiY2xzaWQ6MDJCRjI1RDUtOEMxNy00QjIzLUJDODAtRDM0ODhBQkREQzZCXCIgY29kZWJhc2U9XCJodHRwOi8vd3d3LmFwcGxlLmNvbS9xdGFjdGl2ZXgvcXRwbHVnaW4uY2FiXCIgaGVpZ2h0PVwie2hlaWdodH1cIiB3aWR0aD1cInt3aWR0aH1cIj48cGFyYW0gbmFtZT1cInNyY1wiIHZhbHVlPVwie3BhdGh9XCI+PHBhcmFtIG5hbWU9XCJhdXRvcGxheVwiIHZhbHVlPVwie2F1dG9wbGF5fVwiPjxwYXJhbSBuYW1lPVwidHlwZVwiIHZhbHVlPVwidmlkZW8vcXVpY2t0aW1lXCI+PGVtYmVkIHNyYz1cIntwYXRofVwiIGhlaWdodD1cIntoZWlnaHR9XCIgd2lkdGg9XCJ7d2lkdGh9XCIgYXV0b3BsYXk9XCJ7YXV0b3BsYXl9XCIgdHlwZT1cInZpZGVvL3F1aWNrdGltZVwiIHBsdWdpbnNwYWdlPVwiaHR0cDovL3d3dy5hcHBsZS5jb20vcXVpY2t0aW1lL2Rvd25sb2FkL1wiPjwvZW1iZWQ+PC9vYmplY3Q+JyxpZnJhbWVfbWFya3VwOic8aWZyYW1lIHNyYyA9XCJ7cGF0aH1cIiB3aWR0aD1cInt3aWR0aH1cIiBoZWlnaHQ9XCJ7aGVpZ2h0fVwiIGZyYW1lYm9yZGVyPVwibm9cIj48L2lmcmFtZT4nLGlubGluZV9tYXJrdXA6JzxkaXYgY2xhc3M9XCJwcF9pbmxpbmVcIj57Y29udGVudH08L2Rpdj4nLGN1c3RvbV9tYXJrdXA6XCJcIixzb2NpYWxfdG9vbHM6JzxkaXYgY2xhc3M9XCJ0d2l0dGVyXCI+PGEgaHJlZj1cImh0dHA6Ly90d2l0dGVyLmNvbS9zaGFyZVwiIGNsYXNzPVwidHdpdHRlci1zaGFyZS1idXR0b25cIiBkYXRhLWNvdW50PVwibm9uZVwiPlR3ZWV0PC9hPjxzY3JpcHQgdHlwZT1cInRleHQvamF2YXNjcmlwdFwiIHNyYz1cImh0dHA6Ly9wbGF0Zm9ybS50d2l0dGVyLmNvbS93aWRnZXRzLmpzXCI+PC9zY3JpcHQ+PC9kaXY+PGRpdiBjbGFzcz1cImZhY2Vib29rXCI+PGlmcmFtZSBzcmM9XCIvL3d3dy5mYWNlYm9vay5jb20vcGx1Z2lucy9saWtlLnBocD9sb2NhbGU9ZW5fVVMmaHJlZj17bG9jYXRpb25faHJlZn0mbGF5b3V0PWJ1dHRvbl9jb3VudCZzaG93X2ZhY2VzPXRydWUmd2lkdGg9NTAwJmFjdGlvbj1saWtlJmZvbnQmY29sb3JzY2hlbWU9bGlnaHQmaGVpZ2h0PTIzXCIgc2Nyb2xsaW5nPVwibm9cIiBmcmFtZWJvcmRlcj1cIjBcIiBzdHlsZT1cImJvcmRlcjpub25lOyBvdmVyZmxvdzpoaWRkZW47IHdpZHRoOjUwMHB4OyBoZWlnaHQ6MjNweDtcIiBhbGxvd1RyYW5zcGFyZW5jeT1cInRydWVcIj48L2lmcmFtZT48L2Rpdj4nfSxzKTt2YXIgbz10aGlzLHU9ZmFsc2UsYSxmLGwsYyxoLHAsZD1lKHdpbmRvdykuaGVpZ2h0KCksdj1lKHdpbmRvdykud2lkdGgoKSxtO2RvcmVzaXplPXRydWUsc2Nyb2xsX3Bvcz1UKCk7ZSh3aW5kb3cpLnVuYmluZChcInJlc2l6ZS5wcmV0dHlwaG90b1wiKS5iaW5kKFwicmVzaXplLnByZXR0eXBob3RvXCIsZnVuY3Rpb24oKXt4KCk7TigpfSk7aWYocy5rZXlib2FyZF9zaG9ydGN1dHMpe2UoZG9jdW1lbnQpLnVuYmluZChcImtleWRvd24ucHJldHR5cGhvdG9cIikuYmluZChcImtleWRvd24ucHJldHR5cGhvdG9cIixmdW5jdGlvbih0KXtpZih0eXBlb2YgJHBwX3BpY19ob2xkZXIhPVwidW5kZWZpbmVkXCIpe2lmKCRwcF9waWNfaG9sZGVyLmlzKFwiOnZpc2libGVcIikpe3N3aXRjaCh0LmtleUNvZGUpe2Nhc2UgMzc6ZS5wcmV0dHlQaG90by5jaGFuZ2VQYWdlKFwicHJldmlvdXNcIik7dC5wcmV2ZW50RGVmYXVsdCgpO2JyZWFrO2Nhc2UgMzk6ZS5wcmV0dHlQaG90by5jaGFuZ2VQYWdlKFwibmV4dFwiKTt0LnByZXZlbnREZWZhdWx0KCk7YnJlYWs7Y2FzZSAyNzppZighc2V0dGluZ3MubW9kYWwpZS5wcmV0dHlQaG90by5jbG9zZSgpO3QucHJldmVudERlZmF1bHQoKTticmVha319fX0pfWUucHJldHR5UGhvdG8uaW5pdGlhbGl6ZT1mdW5jdGlvbigpe3NldHRpbmdzPXM7aWYoc2V0dGluZ3MudGhlbWU9PVwicHBfZGVmYXVsdFwiKXNldHRpbmdzLmhvcml6b250YWxfcGFkZGluZz0xNjt0aGVSZWw9ZSh0aGlzKS5hdHRyKHNldHRpbmdzLmhvb2spO2dhbGxlcnlSZWdFeHA9L1xcWyg/Oi4qKVxcXS87aXNTZXQ9Z2FsbGVyeVJlZ0V4cC5leGVjKHRoZVJlbCk/dHJ1ZTpmYWxzZTtwcF9pbWFnZXM9aXNTZXQ/alF1ZXJ5Lm1hcChvLGZ1bmN0aW9uKHQsbil7aWYoZSh0KS5hdHRyKHNldHRpbmdzLmhvb2spLmluZGV4T2YodGhlUmVsKSE9LTEpcmV0dXJuIGUodCkuYXR0cihcImhyZWZcIil9KTplLm1ha2VBcnJheShlKHRoaXMpLmF0dHIoXCJocmVmXCIpKTtwcF90aXRsZXM9aXNTZXQ/alF1ZXJ5Lm1hcChvLGZ1bmN0aW9uKHQsbil7aWYoZSh0KS5hdHRyKHNldHRpbmdzLmhvb2spLmluZGV4T2YodGhlUmVsKSE9LTEpcmV0dXJuIGUodCkuZmluZChcImltZ1wiKS5hdHRyKFwiYWx0XCIpP2UodCkuZmluZChcImltZ1wiKS5hdHRyKFwiYWx0XCIpOlwiXCJ9KTplLm1ha2VBcnJheShlKHRoaXMpLmZpbmQoXCJpbWdcIikuYXR0cihcImFsdFwiKSk7cHBfZGVzY3JpcHRpb25zPWlzU2V0P2pRdWVyeS5tYXAobyxmdW5jdGlvbih0LG4pe2lmKGUodCkuYXR0cihzZXR0aW5ncy5ob29rKS5pbmRleE9mKHRoZVJlbCkhPS0xKXJldHVybiBlKHQpLmF0dHIoXCJ0aXRsZVwiKT9lKHQpLmF0dHIoXCJ0aXRsZVwiKTpcIlwifSk6ZS5tYWtlQXJyYXkoZSh0aGlzKS5hdHRyKFwidGl0bGVcIikpO2lmKHBwX2ltYWdlcy5sZW5ndGg+c2V0dGluZ3Mub3ZlcmxheV9nYWxsZXJ5X21heClzZXR0aW5ncy5vdmVybGF5X2dhbGxlcnk9ZmFsc2U7c2V0X3Bvc2l0aW9uPWpRdWVyeS5pbkFycmF5KGUodGhpcykuYXR0cihcImhyZWZcIikscHBfaW1hZ2VzKTtyZWxfaW5kZXg9aXNTZXQ/c2V0X3Bvc2l0aW9uOmUoXCJhW1wiK3NldHRpbmdzLmhvb2srXCJePSdcIit0aGVSZWwrXCInXVwiKS5pbmRleChlKHRoaXMpKTtrKHRoaXMpO2lmKHNldHRpbmdzLmFsbG93X3Jlc2l6ZSllKHdpbmRvdykuYmluZChcInNjcm9sbC5wcmV0dHlwaG90b1wiLGZ1bmN0aW9uKCl7eCgpfSk7ZS5wcmV0dHlQaG90by5vcGVuKCk7cmV0dXJuIGZhbHNlfTtlLnByZXR0eVBob3RvLm9wZW49ZnVuY3Rpb24odCl7aWYodHlwZW9mIHNldHRpbmdzPT1cInVuZGVmaW5lZFwiKXtzZXR0aW5ncz1zO3BwX2ltYWdlcz1lLm1ha2VBcnJheShhcmd1bWVudHNbMF0pO3BwX3RpdGxlcz1hcmd1bWVudHNbMV0/ZS5tYWtlQXJyYXkoYXJndW1lbnRzWzFdKTplLm1ha2VBcnJheShcIlwiKTtwcF9kZXNjcmlwdGlvbnM9YXJndW1lbnRzWzJdP2UubWFrZUFycmF5KGFyZ3VtZW50c1syXSk6ZS5tYWtlQXJyYXkoXCJcIik7aXNTZXQ9cHBfaW1hZ2VzLmxlbmd0aD4xP3RydWU6ZmFsc2U7c2V0X3Bvc2l0aW9uPWFyZ3VtZW50c1szXT9hcmd1bWVudHNbM106MDtrKHQudGFyZ2V0KX1pZihzZXR0aW5ncy5oaWRlZmxhc2gpZShcIm9iamVjdCxlbWJlZCxpZnJhbWVbc3JjKj15b3V0dWJlXSxpZnJhbWVbc3JjKj12aW1lb11cIikuY3NzKFwidmlzaWJpbGl0eVwiLFwiaGlkZGVuXCIpO2IoZShwcF9pbWFnZXMpLnNpemUoKSk7ZShcIi5wcF9sb2FkZXJJY29uXCIpLnNob3coKTtpZihzZXR0aW5ncy5kZWVwbGlua2luZyluKCk7aWYoc2V0dGluZ3Muc29jaWFsX3Rvb2xzKXtmYWNlYm9va19saWtlX2xpbms9c2V0dGluZ3Muc29jaWFsX3Rvb2xzLnJlcGxhY2UoXCJ7bG9jYXRpb25faHJlZn1cIixlbmNvZGVVUklDb21wb25lbnQobG9jYXRpb24uaHJlZikpOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfc29jaWFsXCIpLmh0bWwoZmFjZWJvb2tfbGlrZV9saW5rKX1pZigkcHB0LmlzKFwiOmhpZGRlblwiKSkkcHB0LmNzcyhcIm9wYWNpdHlcIiwwKS5zaG93KCk7JHBwX292ZXJsYXkuc2hvdygpLmZhZGVUbyhzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQsc2V0dGluZ3Mub3BhY2l0eSk7JHBwX3BpY19ob2xkZXIuZmluZChcIi5jdXJyZW50VGV4dEhvbGRlclwiKS50ZXh0KHNldF9wb3NpdGlvbisxK3NldHRpbmdzLmNvdW50ZXJfc2VwYXJhdG9yX2xhYmVsK2UocHBfaW1hZ2VzKS5zaXplKCkpO2lmKHR5cGVvZiBwcF9kZXNjcmlwdGlvbnNbc2V0X3Bvc2l0aW9uXSE9XCJ1bmRlZmluZWRcIiYmcHBfZGVzY3JpcHRpb25zW3NldF9wb3NpdGlvbl0hPVwiXCIpeyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfZGVzY3JpcHRpb25cIikuc2hvdygpLmh0bWwodW5lc2NhcGUocHBfZGVzY3JpcHRpb25zW3NldF9wb3NpdGlvbl0pKX1lbHNleyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfZGVzY3JpcHRpb25cIikuaGlkZSgpfW1vdmllX3dpZHRoPXBhcnNlRmxvYXQoaShcIndpZHRoXCIscHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pKT9pKFwid2lkdGhcIixwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSk6c2V0dGluZ3MuZGVmYXVsdF93aWR0aC50b1N0cmluZygpO21vdmllX2hlaWdodD1wYXJzZUZsb2F0KGkoXCJoZWlnaHRcIixwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSkpP2koXCJoZWlnaHRcIixwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSk6c2V0dGluZ3MuZGVmYXVsdF9oZWlnaHQudG9TdHJpbmcoKTt1PWZhbHNlO2lmKG1vdmllX2hlaWdodC5pbmRleE9mKFwiJVwiKSE9LTEpe21vdmllX2hlaWdodD1wYXJzZUZsb2F0KGUod2luZG93KS5oZWlnaHQoKSpwYXJzZUZsb2F0KG1vdmllX2hlaWdodCkvMTAwLTE1MCk7dT10cnVlfWlmKG1vdmllX3dpZHRoLmluZGV4T2YoXCIlXCIpIT0tMSl7bW92aWVfd2lkdGg9cGFyc2VGbG9hdChlKHdpbmRvdykud2lkdGgoKSpwYXJzZUZsb2F0KG1vdmllX3dpZHRoKS8xMDAtMTUwKTt1PXRydWV9JHBwX3BpY19ob2xkZXIuZmFkZUluKGZ1bmN0aW9uKCl7c2V0dGluZ3Muc2hvd190aXRsZSYmcHBfdGl0bGVzW3NldF9wb3NpdGlvbl0hPVwiXCImJnR5cGVvZiBwcF90aXRsZXNbc2V0X3Bvc2l0aW9uXSE9XCJ1bmRlZmluZWRcIj8kcHB0Lmh0bWwodW5lc2NhcGUocHBfdGl0bGVzW3NldF9wb3NpdGlvbl0pKTokcHB0Lmh0bWwoXCLCoFwiKTtpbWdQcmVsb2FkZXI9XCJcIjtza2lwSW5qZWN0aW9uPWZhbHNlO3N3aXRjaChTKHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dKSl7Y2FzZVwiaW1hZ2VcIjppbWdQcmVsb2FkZXI9bmV3IEltYWdlO25leHRJbWFnZT1uZXcgSW1hZ2U7aWYoaXNTZXQmJnNldF9wb3NpdGlvbjxlKHBwX2ltYWdlcykuc2l6ZSgpLTEpbmV4dEltYWdlLnNyYz1wcF9pbWFnZXNbc2V0X3Bvc2l0aW9uKzFdO3ByZXZJbWFnZT1uZXcgSW1hZ2U7aWYoaXNTZXQmJnBwX2ltYWdlc1tzZXRfcG9zaXRpb24tMV0pcHJldkltYWdlLnNyYz1wcF9pbWFnZXNbc2V0X3Bvc2l0aW9uLTFdOyRwcF9waWNfaG9sZGVyLmZpbmQoXCIjcHBfZnVsbF9yZXNcIilbMF0uaW5uZXJIVE1MPXNldHRpbmdzLmltYWdlX21hcmt1cC5yZXBsYWNlKC97cGF0aH0vZyxwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSk7aW1nUHJlbG9hZGVyLm9ubG9hZD1mdW5jdGlvbigpe2E9dyhpbWdQcmVsb2FkZXIud2lkdGgsaW1nUHJlbG9hZGVyLmhlaWdodCk7ZygpfTtpbWdQcmVsb2FkZXIub25lcnJvcj1mdW5jdGlvbigpe2FsZXJ0KFwiSW1hZ2UgY2Fubm90IGJlIGxvYWRlZC4gTWFrZSBzdXJlIHRoZSBwYXRoIGlzIGNvcnJlY3QgYW5kIGltYWdlIGV4aXN0LlwiKTtlLnByZXR0eVBob3RvLmNsb3NlKCl9O2ltZ1ByZWxvYWRlci5zcmM9cHBfaW1hZ2VzW3NldF9wb3NpdGlvbl07YnJlYWs7Y2FzZVwieW91dHViZVwiOmE9dyhtb3ZpZV93aWR0aCxtb3ZpZV9oZWlnaHQpO21vdmllX2lkPWkoXCJ2XCIscHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pO2lmKG1vdmllX2lkPT1cIlwiKXttb3ZpZV9pZD1wcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXS5zcGxpdChcInlvdXR1LmJlL1wiKTttb3ZpZV9pZD1tb3ZpZV9pZFsxXTtpZihtb3ZpZV9pZC5pbmRleE9mKFwiP1wiKT4wKW1vdmllX2lkPW1vdmllX2lkLnN1YnN0cigwLG1vdmllX2lkLmluZGV4T2YoXCI/XCIpKTtpZihtb3ZpZV9pZC5pbmRleE9mKFwiJlwiKT4wKW1vdmllX2lkPW1vdmllX2lkLnN1YnN0cigwLG1vdmllX2lkLmluZGV4T2YoXCImXCIpKX1tb3ZpZT1cImh0dHA6Ly93d3cueW91dHViZS5jb20vZW1iZWQvXCIrbW92aWVfaWQ7aShcInJlbFwiLHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dKT9tb3ZpZSs9XCI/cmVsPVwiK2koXCJyZWxcIixwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSk6bW92aWUrPVwiP3JlbD0xXCI7aWYoc2V0dGluZ3MuYXV0b3BsYXkpbW92aWUrPVwiJmF1dG9wbGF5PTFcIjt0b0luamVjdD1zZXR0aW5ncy5pZnJhbWVfbWFya3VwLnJlcGxhY2UoL3t3aWR0aH0vZyxhW1wid2lkdGhcIl0pLnJlcGxhY2UoL3toZWlnaHR9L2csYVtcImhlaWdodFwiXSkucmVwbGFjZSgve3dtb2RlfS9nLHNldHRpbmdzLndtb2RlKS5yZXBsYWNlKC97cGF0aH0vZyxtb3ZpZSk7YnJlYWs7Y2FzZVwidmltZW9cIjphPXcobW92aWVfd2lkdGgsbW92aWVfaGVpZ2h0KTttb3ZpZV9pZD1wcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXTt2YXIgdD0vaHR0cChzPyk6XFwvXFwvKHd3d1xcLik/dmltZW8uY29tXFwvKFxcZCspLzt2YXIgbj1tb3ZpZV9pZC5tYXRjaCh0KTttb3ZpZT1cImh0dHA6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvL1wiK25bM10rXCI/dGl0bGU9MCZieWxpbmU9MCZwb3J0cmFpdD0wXCI7aWYoc2V0dGluZ3MuYXV0b3BsYXkpbW92aWUrPVwiJmF1dG9wbGF5PTE7XCI7dmltZW9fd2lkdGg9YVtcIndpZHRoXCJdK1wiL2VtYmVkLz9tb29nX3dpZHRoPVwiK2FbXCJ3aWR0aFwiXTt0b0luamVjdD1zZXR0aW5ncy5pZnJhbWVfbWFya3VwLnJlcGxhY2UoL3t3aWR0aH0vZyx2aW1lb193aWR0aCkucmVwbGFjZSgve2hlaWdodH0vZyxhW1wiaGVpZ2h0XCJdKS5yZXBsYWNlKC97cGF0aH0vZyxtb3ZpZSk7YnJlYWs7Y2FzZVwicXVpY2t0aW1lXCI6YT13KG1vdmllX3dpZHRoLG1vdmllX2hlaWdodCk7YVtcImhlaWdodFwiXSs9MTU7YVtcImNvbnRlbnRIZWlnaHRcIl0rPTE1O2FbXCJjb250YWluZXJIZWlnaHRcIl0rPTE1O3RvSW5qZWN0PXNldHRpbmdzLnF1aWNrdGltZV9tYXJrdXAucmVwbGFjZSgve3dpZHRofS9nLGFbXCJ3aWR0aFwiXSkucmVwbGFjZSgve2hlaWdodH0vZyxhW1wiaGVpZ2h0XCJdKS5yZXBsYWNlKC97d21vZGV9L2csc2V0dGluZ3Mud21vZGUpLnJlcGxhY2UoL3twYXRofS9nLHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dKS5yZXBsYWNlKC97YXV0b3BsYXl9L2csc2V0dGluZ3MuYXV0b3BsYXkpO2JyZWFrO2Nhc2VcImZsYXNoXCI6YT13KG1vdmllX3dpZHRoLG1vdmllX2hlaWdodCk7Zmxhc2hfdmFycz1wcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXTtmbGFzaF92YXJzPWZsYXNoX3ZhcnMuc3Vic3RyaW5nKHBwX2ltYWdlc1tzZXRfcG9zaXRpb25dLmluZGV4T2YoXCJmbGFzaHZhcnNcIikrMTAscHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0ubGVuZ3RoKTtmaWxlbmFtZT1wcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXTtmaWxlbmFtZT1maWxlbmFtZS5zdWJzdHJpbmcoMCxmaWxlbmFtZS5pbmRleE9mKFwiP1wiKSk7dG9JbmplY3Q9c2V0dGluZ3MuZmxhc2hfbWFya3VwLnJlcGxhY2UoL3t3aWR0aH0vZyxhW1wid2lkdGhcIl0pLnJlcGxhY2UoL3toZWlnaHR9L2csYVtcImhlaWdodFwiXSkucmVwbGFjZSgve3dtb2RlfS9nLHNldHRpbmdzLndtb2RlKS5yZXBsYWNlKC97cGF0aH0vZyxmaWxlbmFtZStcIj9cIitmbGFzaF92YXJzKTticmVhaztjYXNlXCJpZnJhbWVcIjphPXcobW92aWVfd2lkdGgsbW92aWVfaGVpZ2h0KTtmcmFtZV91cmw9cHBfaW1hZ2VzW3NldF9wb3NpdGlvbl07ZnJhbWVfdXJsPWZyYW1lX3VybC5zdWJzdHIoMCxmcmFtZV91cmwuaW5kZXhPZihcImlmcmFtZVwiKS0xKTt0b0luamVjdD1zZXR0aW5ncy5pZnJhbWVfbWFya3VwLnJlcGxhY2UoL3t3aWR0aH0vZyxhW1wid2lkdGhcIl0pLnJlcGxhY2UoL3toZWlnaHR9L2csYVtcImhlaWdodFwiXSkucmVwbGFjZSgve3BhdGh9L2csZnJhbWVfdXJsKTticmVhaztjYXNlXCJhamF4XCI6ZG9yZXNpemU9ZmFsc2U7YT13KG1vdmllX3dpZHRoLG1vdmllX2hlaWdodCk7ZG9yZXNpemU9dHJ1ZTtza2lwSW5qZWN0aW9uPXRydWU7ZS5nZXQocHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0sZnVuY3Rpb24oZSl7dG9JbmplY3Q9c2V0dGluZ3MuaW5saW5lX21hcmt1cC5yZXBsYWNlKC97Y29udGVudH0vZyxlKTskcHBfcGljX2hvbGRlci5maW5kKFwiI3BwX2Z1bGxfcmVzXCIpWzBdLmlubmVySFRNTD10b0luamVjdDtnKCl9KTticmVhaztjYXNlXCJjdXN0b21cIjphPXcobW92aWVfd2lkdGgsbW92aWVfaGVpZ2h0KTt0b0luamVjdD1zZXR0aW5ncy5jdXN0b21fbWFya3VwO2JyZWFrO2Nhc2VcImlubGluZVwiOm15Q2xvbmU9ZShwcF9pbWFnZXNbc2V0X3Bvc2l0aW9uXSkuY2xvbmUoKS5hcHBlbmQoJzxiciBjbGVhcj1cImFsbFwiIC8+JykuY3NzKHt3aWR0aDpzZXR0aW5ncy5kZWZhdWx0X3dpZHRofSkud3JhcElubmVyKCc8ZGl2IGlkPVwicHBfZnVsbF9yZXNcIj48ZGl2IGNsYXNzPVwicHBfaW5saW5lXCI+PC9kaXY+PC9kaXY+JykuYXBwZW5kVG8oZShcImJvZHlcIikpLnNob3coKTtkb3Jlc2l6ZT1mYWxzZTthPXcoZShteUNsb25lKS53aWR0aCgpLGUobXlDbG9uZSkuaGVpZ2h0KCkpO2RvcmVzaXplPXRydWU7ZShteUNsb25lKS5yZW1vdmUoKTt0b0luamVjdD1zZXR0aW5ncy5pbmxpbmVfbWFya3VwLnJlcGxhY2UoL3tjb250ZW50fS9nLGUocHBfaW1hZ2VzW3NldF9wb3NpdGlvbl0pLmh0bWwoKSk7YnJlYWt9aWYoIWltZ1ByZWxvYWRlciYmIXNraXBJbmplY3Rpb24peyRwcF9waWNfaG9sZGVyLmZpbmQoXCIjcHBfZnVsbF9yZXNcIilbMF0uaW5uZXJIVE1MPXRvSW5qZWN0O2coKX19KTtyZXR1cm4gZmFsc2V9O2UucHJldHR5UGhvdG8uY2hhbmdlUGFnZT1mdW5jdGlvbih0KXtjdXJyZW50R2FsbGVyeVBhZ2U9MDtpZih0PT1cInByZXZpb3VzXCIpe3NldF9wb3NpdGlvbi0tO2lmKHNldF9wb3NpdGlvbjwwKXNldF9wb3NpdGlvbj1lKHBwX2ltYWdlcykuc2l6ZSgpLTF9ZWxzZSBpZih0PT1cIm5leHRcIil7c2V0X3Bvc2l0aW9uKys7aWYoc2V0X3Bvc2l0aW9uPmUocHBfaW1hZ2VzKS5zaXplKCktMSlzZXRfcG9zaXRpb249MH1lbHNle3NldF9wb3NpdGlvbj10fXJlbF9pbmRleD1zZXRfcG9zaXRpb247aWYoIWRvcmVzaXplKWRvcmVzaXplPXRydWU7aWYoc2V0dGluZ3MuYWxsb3dfZXhwYW5kKXtlKFwiLnBwX2NvbnRyYWN0XCIpLnJlbW92ZUNsYXNzKFwicHBfY29udHJhY3RcIikuYWRkQ2xhc3MoXCJwcF9leHBhbmRcIil9eShmdW5jdGlvbigpe2UucHJldHR5UGhvdG8ub3BlbigpfSl9O2UucHJldHR5UGhvdG8uY2hhbmdlR2FsbGVyeVBhZ2U9ZnVuY3Rpb24oZSl7aWYoZT09XCJuZXh0XCIpe2N1cnJlbnRHYWxsZXJ5UGFnZSsrO2lmKGN1cnJlbnRHYWxsZXJ5UGFnZT50b3RhbFBhZ2UpY3VycmVudEdhbGxlcnlQYWdlPTB9ZWxzZSBpZihlPT1cInByZXZpb3VzXCIpe2N1cnJlbnRHYWxsZXJ5UGFnZS0tO2lmKGN1cnJlbnRHYWxsZXJ5UGFnZTwwKWN1cnJlbnRHYWxsZXJ5UGFnZT10b3RhbFBhZ2V9ZWxzZXtjdXJyZW50R2FsbGVyeVBhZ2U9ZX1zbGlkZV9zcGVlZD1lPT1cIm5leHRcInx8ZT09XCJwcmV2aW91c1wiP3NldHRpbmdzLmFuaW1hdGlvbl9zcGVlZDowO3NsaWRlX3RvPWN1cnJlbnRHYWxsZXJ5UGFnZSppdGVtc1BlclBhZ2UqaXRlbVdpZHRoOyRwcF9nYWxsZXJ5LmZpbmQoXCJ1bFwiKS5hbmltYXRlKHtsZWZ0Oi1zbGlkZV90b30sc2xpZGVfc3BlZWQpfTtlLnByZXR0eVBob3RvLnN0YXJ0U2xpZGVzaG93PWZ1bmN0aW9uKCl7aWYodHlwZW9mIG09PVwidW5kZWZpbmVkXCIpeyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfcGxheVwiKS51bmJpbmQoXCJjbGlja1wiKS5yZW1vdmVDbGFzcyhcInBwX3BsYXlcIikuYWRkQ2xhc3MoXCJwcF9wYXVzZVwiKS5jbGljayhmdW5jdGlvbigpe2UucHJldHR5UGhvdG8uc3RvcFNsaWRlc2hvdygpO3JldHVybiBmYWxzZX0pO209c2V0SW50ZXJ2YWwoZS5wcmV0dHlQaG90by5zdGFydFNsaWRlc2hvdyxzZXR0aW5ncy5zbGlkZXNob3cpfWVsc2V7ZS5wcmV0dHlQaG90by5jaGFuZ2VQYWdlKFwibmV4dFwiKX19O2UucHJldHR5UGhvdG8uc3RvcFNsaWRlc2hvdz1mdW5jdGlvbigpeyRwcF9waWNfaG9sZGVyLmZpbmQoXCIucHBfcGF1c2VcIikudW5iaW5kKFwiY2xpY2tcIikucmVtb3ZlQ2xhc3MoXCJwcF9wYXVzZVwiKS5hZGRDbGFzcyhcInBwX3BsYXlcIikuY2xpY2soZnVuY3Rpb24oKXtlLnByZXR0eVBob3RvLnN0YXJ0U2xpZGVzaG93KCk7cmV0dXJuIGZhbHNlfSk7Y2xlYXJJbnRlcnZhbChtKTttPXVuZGVmaW5lZH07ZS5wcmV0dHlQaG90by5jbG9zZT1mdW5jdGlvbigpe2lmKCRwcF9vdmVybGF5LmlzKFwiOmFuaW1hdGVkXCIpKXJldHVybjtlLnByZXR0eVBob3RvLnN0b3BTbGlkZXNob3coKTskcHBfcGljX2hvbGRlci5zdG9wKCkuZmluZChcIm9iamVjdCxlbWJlZFwiKS5jc3MoXCJ2aXNpYmlsaXR5XCIsXCJoaWRkZW5cIik7ZShcImRpdi5wcF9waWNfaG9sZGVyLGRpdi5wcHQsLnBwX2ZhZGVcIikuZmFkZU91dChzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQsZnVuY3Rpb24oKXtlKHRoaXMpLnJlbW92ZSgpfSk7JHBwX292ZXJsYXkuZmFkZU91dChzZXR0aW5ncy5hbmltYXRpb25fc3BlZWQsZnVuY3Rpb24oKXtpZihzZXR0aW5ncy5oaWRlZmxhc2gpZShcIm9iamVjdCxlbWJlZCxpZnJhbWVbc3JjKj15b3V0dWJlXSxpZnJhbWVbc3JjKj12aW1lb11cIikuY3NzKFwidmlzaWJpbGl0eVwiLFwidmlzaWJsZVwiKTtlKHRoaXMpLnJlbW92ZSgpO2Uod2luZG93KS51bmJpbmQoXCJzY3JvbGwucHJldHR5cGhvdG9cIik7cigpO3NldHRpbmdzLmNhbGxiYWNrKCk7ZG9yZXNpemU9dHJ1ZTtmPWZhbHNlO2RlbGV0ZSBzZXR0aW5nc30pfTtpZighcHBfYWxyZWFkeUluaXRpYWxpemVkJiZ0KCkpe3BwX2FscmVhZHlJbml0aWFsaXplZD10cnVlO2hhc2hJbmRleD10KCk7aGFzaFJlbD1oYXNoSW5kZXg7aGFzaEluZGV4PWhhc2hJbmRleC5zdWJzdHJpbmcoaGFzaEluZGV4LmluZGV4T2YoXCIvXCIpKzEsaGFzaEluZGV4Lmxlbmd0aC0xKTtoYXNoUmVsPWhhc2hSZWwuc3Vic3RyaW5nKDAsaGFzaFJlbC5pbmRleE9mKFwiL1wiKSk7c2V0VGltZW91dChmdW5jdGlvbigpe2UoXCJhW1wiK3MuaG9vaytcIl49J1wiK2hhc2hSZWwrXCInXTplcShcIitoYXNoSW5kZXgrXCIpXCIpLnRyaWdnZXIoXCJjbGlja1wiKX0sNTApfXJldHVybiB0aGlzLnVuYmluZChcImNsaWNrLnByZXR0eXBob3RvXCIpLmJpbmQoXCJjbGljay5wcmV0dHlwaG90b1wiLGUucHJldHR5UGhvdG8uaW5pdGlhbGl6ZSl9O30pKGpRdWVyeSk7dmFyIHBwX2FscmVhZHlJbml0aWFsaXplZD1mYWxzZSIsIlxuZnVuY3Rpb24gbWFpbigpIHtcblxuKGZ1bmN0aW9uICgpIHtcbiAgICd1c2Ugc3RyaWN0JztcbiAgIFxuICAgLy8gVGVzdGltb25pYWwgc2xpZGVyXG4gIFx0JCgnYS5wYWdlLXNjcm9sbCcpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAobG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sJycpID09IHRoaXMucGF0aG5hbWUucmVwbGFjZSgvXlxcLy8sJycpICYmIGxvY2F0aW9uLmhvc3RuYW1lID09IHRoaXMuaG9zdG5hbWUpIHtcbiAgICAgICAgICB2YXIgdGFyZ2V0ID0gJCh0aGlzLmhhc2gpO1xuICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5sZW5ndGggPyB0YXJnZXQgOiAkKCdbbmFtZT0nICsgdGhpcy5oYXNoLnNsaWNlKDEpICsnXScpO1xuICAgICAgICAgIGlmICh0YXJnZXQubGVuZ3RoKSB7XG4gICAgICAgICAgICAkKCdodG1sLGJvZHknKS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgc2Nyb2xsVG9wOiB0YXJnZXQub2Zmc2V0KCkudG9wIC0gNDBcbiAgICAgICAgICAgIH0sIDkwMCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICBcdCQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBcdCAgICAkKFwiI3Rlc3RpbW9uaWFsXCIpLm93bENhcm91c2VsKHtcbiAgICAgICAgbmF2aWdhdGlvbiA6IGZhbHNlLCAvLyBTaG93IG5leHQgYW5kIHByZXYgYnV0dG9uc1xuICAgICAgICBzbGlkZVNwZWVkIDogMzAwLFxuICAgICAgICBwYWdpbmF0aW9uU3BlZWQgOiA0MDAsXG4gICAgICAgIHNpbmdsZUl0ZW06dHJ1ZVxuICAgICAgICB9KTtcblxuICBcdH0pO1xuXHRcblxuICBcdC8vIFBvcnRmb2xpbyBpc290b3BlIGZpbHRlclxuICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGNvbnRhaW5lciA9ICQoJy5wcm9qZWN0LWl0ZW1zJyk7XG4gICAgICAgICRjb250YWluZXIuaXNvdG9wZSh7XG4gICAgICAgICAgICBmaWx0ZXI6ICcqJyxcbiAgICAgICAgICAgIGFuaW1hdGlvbk9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogNzUwLFxuICAgICAgICAgICAgICAgIGVhc2luZzogJ2xpbmVhcicsXG4gICAgICAgICAgICAgICAgcXVldWU6IGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkKCcuY2F0IGEnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJy5jYXQgLmFjdGl2ZScpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAgICAgdmFyIHNlbGVjdG9yID0gJCh0aGlzKS5hdHRyKCdkYXRhLWZpbHRlcicpO1xuICAgICAgICAgICAgJGNvbnRhaW5lci5pc290b3BlKHtcbiAgICAgICAgICAgICAgICBmaWx0ZXI6IHNlbGVjdG9yLFxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbk9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDc1MCxcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnbGluZWFyJyxcbiAgICAgICAgICAgICAgICAgICAgcXVldWU6IGZhbHNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblx0XG5cbiAgXHQvLyBQcmV0dHkgUGhvdG9cblx0JChcImFbcmVsXj0ncHJldHR5UGhvdG8nXVwiKS5wcmV0dHlQaG90byh7XG5cdFx0c29jaWFsX3Rvb2xzOiBmYWxzZVxuXHR9KTtcdFxuXG59KCkpO1xuXG5cbn1cbm1haW4oKTsiLCIvKlxuICogIGpRdWVyeSBPd2xDYXJvdXNlbCB2MS4zLjJcbiAqXG4gKiAgQ29weXJpZ2h0IChjKSAyMDEzIEJhcnRvc3ogV29qY2llY2hvd3NraVxuICogIGh0dHA6Ly93d3cub3dsZ3JhcGhpYy5jb20vb3dsY2Fyb3VzZWwvXG4gKlxuICogIExpY2Vuc2VkIHVuZGVyIE1JVFxuICpcbiAqL1xuXG4vKkpTIExpbnQgaGVscGVyczogKi9cbi8qZ2xvYmFsIGRyYWdNb3ZlOiBmYWxzZSwgZHJhZ0VuZDogZmFsc2UsICQsIGpRdWVyeSwgYWxlcnQsIHdpbmRvdywgZG9jdW1lbnQgKi9cbi8qanNsaW50IG5vbWVuOiB0cnVlLCBjb250aW51ZTp0cnVlICovXG5cbmlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgT2JqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgZnVuY3Rpb24gRigpIHt9XG4gICAgICAgIEYucHJvdG90eXBlID0gb2JqO1xuICAgICAgICByZXR1cm4gbmV3IEYoKTtcbiAgICB9O1xufVxuKGZ1bmN0aW9uICgkLCB3aW5kb3csIGRvY3VtZW50KSB7XG5cbiAgICB2YXIgQ2Fyb3VzZWwgPSB7XG4gICAgICAgIGluaXQgOiBmdW5jdGlvbiAob3B0aW9ucywgZWwpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgYmFzZS4kZWxlbSA9ICQoZWwpO1xuICAgICAgICAgICAgYmFzZS5vcHRpb25zID0gJC5leHRlbmQoe30sICQuZm4ub3dsQ2Fyb3VzZWwub3B0aW9ucywgYmFzZS4kZWxlbS5kYXRhKCksIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBiYXNlLnVzZXJPcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgICAgIGJhc2UubG9hZENvbnRlbnQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkQ29udGVudCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcywgdXJsO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBnZXREYXRhKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgaSwgY29udGVudCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuanNvblN1Y2Nlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuanNvblN1Y2Nlc3MuYXBwbHkodGhpcywgW2RhdGFdKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGkgaW4gZGF0YS5vd2wpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhLm93bC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgKz0gZGF0YS5vd2xbaV0uaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmh0bWwoY29udGVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJhc2UubG9nSW4oKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYmVmb3JlSW5pdCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmJlZm9yZUluaXQuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuanNvblBhdGggPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICB1cmwgPSBiYXNlLm9wdGlvbnMuanNvblBhdGg7XG4gICAgICAgICAgICAgICAgJC5nZXRKU09OKHVybCwgZ2V0RGF0YSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UubG9nSW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBsb2dJbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgYmFzZS4kZWxlbS5kYXRhKFwib3dsLW9yaWdpbmFsU3R5bGVzXCIsIGJhc2UuJGVsZW0uYXR0cihcInN0eWxlXCIpKVxuICAgICAgICAgICAgICAgICAgICAgIC5kYXRhKFwib3dsLW9yaWdpbmFsQ2xhc3Nlc1wiLCBiYXNlLiRlbGVtLmF0dHIoXCJjbGFzc1wiKSk7XG5cbiAgICAgICAgICAgIGJhc2UuJGVsZW0uY3NzKHtvcGFjaXR5OiAwfSk7XG4gICAgICAgICAgICBiYXNlLm9yaWduYWxJdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtcztcbiAgICAgICAgICAgIGJhc2UuY2hlY2tCcm93c2VyKCk7XG4gICAgICAgICAgICBiYXNlLndyYXBwZXJXaWR0aCA9IDA7XG4gICAgICAgICAgICBiYXNlLmNoZWNrVmlzaWJsZSA9IG51bGw7XG4gICAgICAgICAgICBiYXNlLnNldFZhcnMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzZXRWYXJzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2UuJGVsZW0uY2hpbGRyZW4oKS5sZW5ndGggPT09IDApIHtyZXR1cm4gZmFsc2U7IH1cbiAgICAgICAgICAgIGJhc2UuYmFzZUNsYXNzKCk7XG4gICAgICAgICAgICBiYXNlLmV2ZW50VHlwZXMoKTtcbiAgICAgICAgICAgIGJhc2UuJHVzZXJJdGVtcyA9IGJhc2UuJGVsZW0uY2hpbGRyZW4oKTtcbiAgICAgICAgICAgIGJhc2UuaXRlbXNBbW91bnQgPSBiYXNlLiR1c2VySXRlbXMubGVuZ3RoO1xuICAgICAgICAgICAgYmFzZS53cmFwSXRlbXMoKTtcbiAgICAgICAgICAgIGJhc2UuJG93bEl0ZW1zID0gYmFzZS4kZWxlbS5maW5kKFwiLm93bC1pdGVtXCIpO1xuICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlciA9IGJhc2UuJGVsZW0uZmluZChcIi5vd2wtd3JhcHBlclwiKTtcbiAgICAgICAgICAgIGJhc2UucGxheURpcmVjdGlvbiA9IFwibmV4dFwiO1xuICAgICAgICAgICAgYmFzZS5wcmV2SXRlbSA9IDA7XG4gICAgICAgICAgICBiYXNlLnByZXZBcnIgPSBbMF07XG4gICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gMDtcbiAgICAgICAgICAgIGJhc2UuY3VzdG9tRXZlbnRzKCk7XG4gICAgICAgICAgICBiYXNlLm9uU3RhcnR1cCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU3RhcnR1cCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UudXBkYXRlSXRlbXMoKTtcbiAgICAgICAgICAgIGJhc2UuY2FsY3VsYXRlQWxsKCk7XG4gICAgICAgICAgICBiYXNlLmJ1aWxkQ29udHJvbHMoKTtcbiAgICAgICAgICAgIGJhc2UudXBkYXRlQ29udHJvbHMoKTtcbiAgICAgICAgICAgIGJhc2UucmVzcG9uc2UoKTtcbiAgICAgICAgICAgIGJhc2UubW92ZUV2ZW50cygpO1xuICAgICAgICAgICAgYmFzZS5zdG9wT25Ib3ZlcigpO1xuICAgICAgICAgICAgYmFzZS5vd2xTdGF0dXMoKTtcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy50cmFuc2l0aW9uU3R5bGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS50cmFuc2l0aW9uVHlwZXMoYmFzZS5vcHRpb25zLnRyYW5zaXRpb25TdHlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9QbGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmF1dG9QbGF5ID0gNTAwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UucGxheSgpO1xuXG4gICAgICAgICAgICBiYXNlLiRlbGVtLmZpbmQoXCIub3dsLXdyYXBwZXJcIikuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xuXG4gICAgICAgICAgICBpZiAoIWJhc2UuJGVsZW0uaXMoXCI6dmlzaWJsZVwiKSkge1xuICAgICAgICAgICAgICAgIGJhc2Uud2F0Y2hWaXNpYmlsaXR5KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uY3NzKFwib3BhY2l0eVwiLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2Uub25zdGFydHVwID0gZmFsc2U7XG4gICAgICAgICAgICBiYXNlLmVhY2hNb3ZlVXBkYXRlKCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5hZnRlckluaXQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hZnRlckluaXQuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlYWNoTW92ZVVwZGF0ZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5sYXp5TG9hZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UubGF6eUxvYWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b0hlaWdodCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuYXV0b0hlaWdodCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS5vblZpc2libGVJdGVtcygpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5hZnRlckFjdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmFmdGVyQWN0aW9uLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlVmFycyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYmFzZS5vcHRpb25zLmJlZm9yZVVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmJlZm9yZVVwZGF0ZS5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS53YXRjaFZpc2liaWxpdHkoKTtcbiAgICAgICAgICAgIGJhc2UudXBkYXRlSXRlbXMoKTtcbiAgICAgICAgICAgIGJhc2UuY2FsY3VsYXRlQWxsKCk7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZVBvc2l0aW9uKCk7XG4gICAgICAgICAgICBiYXNlLnVwZGF0ZUNvbnRyb2xzKCk7XG4gICAgICAgICAgICBiYXNlLmVhY2hNb3ZlVXBkYXRlKCk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5hZnRlclVwZGF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmFmdGVyVXBkYXRlLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVsb2FkIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhc2UudXBkYXRlVmFycygpO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2F0Y2hWaXNpYmlsaXR5IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5pcyhcIjp2aXNpYmxlXCIpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uY3NzKHtvcGFjaXR5OiAwfSk7XG4gICAgICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5hdXRvUGxheUludGVydmFsKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmNoZWNrVmlzaWJsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuY2hlY2tWaXNpYmxlID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5pcyhcIjp2aXNpYmxlXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0uYW5pbWF0ZSh7b3BhY2l0eTogMX0sIDIwMCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuY2hlY2tWaXNpYmxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdyYXBJdGVtcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuJHVzZXJJdGVtcy53cmFwQWxsKFwiPGRpdiBjbGFzcz1cXFwib3dsLXdyYXBwZXJcXFwiPlwiKS53cmFwKFwiPGRpdiBjbGFzcz1cXFwib3dsLWl0ZW1cXFwiPjwvZGl2PlwiKTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0uZmluZChcIi5vd2wtd3JhcHBlclwiKS53cmFwKFwiPGRpdiBjbGFzcz1cXFwib3dsLXdyYXBwZXItb3V0ZXJcXFwiPlwiKTtcbiAgICAgICAgICAgIGJhc2Uud3JhcHBlck91dGVyID0gYmFzZS4kZWxlbS5maW5kKFwiLm93bC13cmFwcGVyLW91dGVyXCIpO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmFzZUNsYXNzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGhhc0Jhc2VDbGFzcyA9IGJhc2UuJGVsZW0uaGFzQ2xhc3MoYmFzZS5vcHRpb25zLmJhc2VDbGFzcyksXG4gICAgICAgICAgICAgICAgaGFzVGhlbWVDbGFzcyA9IGJhc2UuJGVsZW0uaGFzQ2xhc3MoYmFzZS5vcHRpb25zLnRoZW1lKTtcblxuICAgICAgICAgICAgaWYgKCFoYXNCYXNlQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmFkZENsYXNzKGJhc2Uub3B0aW9ucy5iYXNlQ2xhc3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWhhc1RoZW1lQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLmFkZENsYXNzKGJhc2Uub3B0aW9ucy50aGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlSXRlbXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsIHdpZHRoLCBpO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnJlc3BvbnNpdmUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5zaW5nbGVJdGVtID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zID0gYmFzZS5vcmlnbmFsSXRlbXMgPSAxO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc0N1c3RvbSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc0Rlc2t0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wU21hbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXRTbWFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtc01vYmlsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2lkdGggPSAkKGJhc2Uub3B0aW9ucy5yZXNwb25zaXZlQmFzZVdpZHRoKS53aWR0aCgpO1xuXG4gICAgICAgICAgICBpZiAod2lkdGggPiAoYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFswXSB8fCBiYXNlLm9yaWduYWxJdGVtcykpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9yaWduYWxJdGVtcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuaXRlbXNDdXN0b20gIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgLy9SZW9yZGVyIGFycmF5IGJ5IHNjcmVlbiBzaXplXG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLml0ZW1zQ3VzdG9tLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtyZXR1cm4gYVswXSAtIGJbMF07IH0pO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJhc2Uub3B0aW9ucy5pdGVtc0N1c3RvbS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLml0ZW1zQ3VzdG9tW2ldWzBdIDw9IHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNDdXN0b21baV1bMV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPD0gYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFswXSAmJiBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wWzFdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA8PSBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wU21hbGxbMF0gJiYgYmFzZS5vcHRpb25zLml0ZW1zRGVza3RvcFNtYWxsICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNEZXNrdG9wU21hbGxbMV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDw9IGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFswXSAmJiBiYXNlLm9wdGlvbnMuaXRlbXNUYWJsZXQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFsxXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPD0gYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0U21hbGxbMF0gJiYgYmFzZS5vcHRpb25zLml0ZW1zVGFibGV0U21hbGwgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5pdGVtcyA9IGJhc2Uub3B0aW9ucy5pdGVtc1RhYmxldFNtYWxsWzFdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA8PSBiYXNlLm9wdGlvbnMuaXRlbXNNb2JpbGVbMF0gJiYgYmFzZS5vcHRpb25zLml0ZW1zTW9iaWxlICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLm9wdGlvbnMuaXRlbXNNb2JpbGVbMV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL2lmIG51bWJlciBvZiBpdGVtcyBpcyBsZXNzIHRoYW4gZGVjbGFyZWRcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuaXRlbXMgPiBiYXNlLml0ZW1zQW1vdW50ICYmIGJhc2Uub3B0aW9ucy5pdGVtc1NjYWxlVXAgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuaXRlbXMgPSBiYXNlLml0ZW1zQW1vdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHJlc3BvbnNlIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHNtYWxsRGVsYXksXG4gICAgICAgICAgICAgICAgbGFzdFdpbmRvd1dpZHRoO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnJlc3BvbnNpdmUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0V2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcblxuICAgICAgICAgICAgYmFzZS5yZXNpemVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSAhPT0gbGFzdFdpbmRvd1dpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbChiYXNlLmF1dG9QbGF5SW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQoc21hbGxEZWxheSk7XG4gICAgICAgICAgICAgICAgICAgIHNtYWxsRGVsYXkgPSB3aW5kb3cuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0V2luZG93V2lkdGggPSAkKHdpbmRvdykud2lkdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UudXBkYXRlVmFycygpO1xuICAgICAgICAgICAgICAgICAgICB9LCBiYXNlLm9wdGlvbnMucmVzcG9uc2l2ZVJlZnJlc2hSYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShiYXNlLnJlc2l6ZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5qdW1wVG8oYmFzZS5jdXJyZW50SXRlbSk7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmF1dG9QbGF5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuY2hlY2tBcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFwcGVuZEl0ZW1zU2l6ZXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgcm91bmRQYWdlcyA9IDAsXG4gICAgICAgICAgICAgICAgbGFzdEl0ZW0gPSBiYXNlLml0ZW1zQW1vdW50IC0gYmFzZS5vcHRpb25zLml0ZW1zO1xuXG4gICAgICAgICAgICBiYXNlLiRvd2xJdGVtcy5lYWNoKGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgJHRoaXNcbiAgICAgICAgICAgICAgICAgICAgLmNzcyh7XCJ3aWR0aFwiOiBiYXNlLml0ZW1XaWR0aH0pXG4gICAgICAgICAgICAgICAgICAgIC5kYXRhKFwib3dsLWl0ZW1cIiwgTnVtYmVyKGluZGV4KSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggJSBiYXNlLm9wdGlvbnMuaXRlbXMgPT09IDAgfHwgaW5kZXggPT09IGxhc3RJdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghKGluZGV4ID4gbGFzdEl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3VuZFBhZ2VzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHRoaXMuZGF0YShcIm93bC1yb3VuZFBhZ2VzXCIsIHJvdW5kUGFnZXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYXBwZW5kV3JhcHBlclNpemVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHdpZHRoID0gYmFzZS4kb3dsSXRlbXMubGVuZ3RoICogYmFzZS5pdGVtV2lkdGg7XG5cbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKHtcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHdpZHRoICogMixcbiAgICAgICAgICAgICAgICBcImxlZnRcIjogMFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmFwcGVuZEl0ZW1zU2l6ZXMoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxjdWxhdGVBbGwgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLmNhbGN1bGF0ZVdpZHRoKCk7XG4gICAgICAgICAgICBiYXNlLmFwcGVuZFdyYXBwZXJTaXplcygpO1xuICAgICAgICAgICAgYmFzZS5sb29wcygpO1xuICAgICAgICAgICAgYmFzZS5tYXgoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxjdWxhdGVXaWR0aCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuaXRlbVdpZHRoID0gTWF0aC5yb3VuZChiYXNlLiRlbGVtLndpZHRoKCkgLyBiYXNlLm9wdGlvbnMuaXRlbXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1heCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBtYXhpbXVtID0gKChiYXNlLml0ZW1zQW1vdW50ICogYmFzZS5pdGVtV2lkdGgpIC0gYmFzZS5vcHRpb25zLml0ZW1zICogYmFzZS5pdGVtV2lkdGgpICogLTE7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLml0ZW1zID4gYmFzZS5pdGVtc0Ftb3VudCkge1xuICAgICAgICAgICAgICAgIGJhc2UubWF4aW11bUl0ZW0gPSAwO1xuICAgICAgICAgICAgICAgIG1heGltdW0gPSAwO1xuICAgICAgICAgICAgICAgIGJhc2UubWF4aW11bVBpeGVscyA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJhc2UubWF4aW11bUl0ZW0gPSBiYXNlLml0ZW1zQW1vdW50IC0gYmFzZS5vcHRpb25zLml0ZW1zO1xuICAgICAgICAgICAgICAgIGJhc2UubWF4aW11bVBpeGVscyA9IG1heGltdW07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF4aW11bTtcbiAgICAgICAgfSxcblxuICAgICAgICBtaW4gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSxcblxuICAgICAgICBsb29wcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBwcmV2ID0gMCxcbiAgICAgICAgICAgICAgICBlbFdpZHRoID0gMCxcbiAgICAgICAgICAgICAgICBpLFxuICAgICAgICAgICAgICAgIGl0ZW0sXG4gICAgICAgICAgICAgICAgcm91bmRQYWdlTnVtO1xuXG4gICAgICAgICAgICBiYXNlLnBvc2l0aW9uc0luQXJyYXkgPSBbMF07XG4gICAgICAgICAgICBiYXNlLnBhZ2VzSW5BcnJheSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYmFzZS5pdGVtc0Ftb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZWxXaWR0aCArPSBiYXNlLml0ZW1XaWR0aDtcbiAgICAgICAgICAgICAgICBiYXNlLnBvc2l0aW9uc0luQXJyYXkucHVzaCgtZWxXaWR0aCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbSA9ICQoYmFzZS4kb3dsSXRlbXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICByb3VuZFBhZ2VOdW0gPSBpdGVtLmRhdGEoXCJvd2wtcm91bmRQYWdlc1wiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdW5kUGFnZU51bSAhPT0gcHJldikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5wYWdlc0luQXJyYXlbcHJldl0gPSBiYXNlLnBvc2l0aW9uc0luQXJyYXlbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmV2ID0gcm91bmRQYWdlTnVtO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGJ1aWxkQ29udHJvbHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLm5hdmlnYXRpb24gPT09IHRydWUgfHwgYmFzZS5vcHRpb25zLnBhZ2luYXRpb24gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm93bENvbnRyb2xzID0gJChcIjxkaXYgY2xhc3M9XFxcIm93bC1jb250cm9sc1xcXCIvPlwiKS50b2dnbGVDbGFzcyhcImNsaWNrYWJsZVwiLCAhYmFzZS5icm93c2VyLmlzVG91Y2gpLmFwcGVuZFRvKGJhc2UuJGVsZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5idWlsZFBhZ2luYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubmF2aWdhdGlvbiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuYnVpbGRCdXR0b25zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYnVpbGRCdXR0b25zIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGJ1dHRvbnNXcmFwcGVyID0gJChcIjxkaXYgY2xhc3M9XFxcIm93bC1idXR0b25zXFxcIi8+XCIpO1xuICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5hcHBlbmQoYnV0dG9uc1dyYXBwZXIpO1xuXG4gICAgICAgICAgICBiYXNlLmJ1dHRvblByZXYgPSAkKFwiPGRpdi8+XCIsIHtcbiAgICAgICAgICAgICAgICBcImNsYXNzXCIgOiBcIm93bC1wcmV2XCIsXG4gICAgICAgICAgICAgICAgXCJodG1sXCIgOiBiYXNlLm9wdGlvbnMubmF2aWdhdGlvblRleHRbMF0gfHwgXCJcIlxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJhc2UuYnV0dG9uTmV4dCA9ICQoXCI8ZGl2Lz5cIiwge1xuICAgICAgICAgICAgICAgIFwiY2xhc3NcIiA6IFwib3dsLW5leHRcIixcbiAgICAgICAgICAgICAgICBcImh0bWxcIiA6IGJhc2Uub3B0aW9ucy5uYXZpZ2F0aW9uVGV4dFsxXSB8fCBcIlwiXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYnV0dG9uc1dyYXBwZXJcbiAgICAgICAgICAgICAgICAuYXBwZW5kKGJhc2UuYnV0dG9uUHJldilcbiAgICAgICAgICAgICAgICAuYXBwZW5kKGJhc2UuYnV0dG9uTmV4dCk7XG5cbiAgICAgICAgICAgIGJ1dHRvbnNXcmFwcGVyLm9uKFwidG91Y2hzdGFydC5vd2xDb250cm9scyBtb3VzZWRvd24ub3dsQ29udHJvbHNcIiwgXCJkaXZbY2xhc3NePVxcXCJvd2xcXFwiXVwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGJ1dHRvbnNXcmFwcGVyLm9uKFwidG91Y2hlbmQub3dsQ29udHJvbHMgbW91c2V1cC5vd2xDb250cm9sc1wiLCBcImRpdltjbGFzc149XFxcIm93bFxcXCJdXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoXCJvd2wtbmV4dFwiKSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm5leHQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnByZXYoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBidWlsZFBhZ2luYXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXIgPSAkKFwiPGRpdiBjbGFzcz1cXFwib3dsLXBhZ2luYXRpb25cXFwiLz5cIik7XG4gICAgICAgICAgICBiYXNlLm93bENvbnRyb2xzLmFwcGVuZChiYXNlLnBhZ2luYXRpb25XcmFwcGVyKTtcblxuICAgICAgICAgICAgYmFzZS5wYWdpbmF0aW9uV3JhcHBlci5vbihcInRvdWNoZW5kLm93bENvbnRyb2xzIG1vdXNldXAub3dsQ29udHJvbHNcIiwgXCIub3dsLXBhZ2VcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoTnVtYmVyKCQodGhpcykuZGF0YShcIm93bC1wYWdlXCIpKSAhPT0gYmFzZS5jdXJyZW50SXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmdvVG8oTnVtYmVyKCQodGhpcykuZGF0YShcIm93bC1wYWdlXCIpKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlUGFnaW5hdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb3VudGVyLFxuICAgICAgICAgICAgICAgIGxhc3RQYWdlLFxuICAgICAgICAgICAgICAgIGxhc3RJdGVtLFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbixcbiAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uSW5uZXI7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucGFnaW5hdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXIuaHRtbChcIlwiKTtcblxuICAgICAgICAgICAgY291bnRlciA9IDA7XG4gICAgICAgICAgICBsYXN0UGFnZSA9IGJhc2UuaXRlbXNBbW91bnQgLSBiYXNlLml0ZW1zQW1vdW50ICUgYmFzZS5vcHRpb25zLml0ZW1zO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYmFzZS5pdGVtc0Ftb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGkgJSBiYXNlLm9wdGlvbnMuaXRlbXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciArPSAxO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGFzdFBhZ2UgPT09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RJdGVtID0gYmFzZS5pdGVtc0Ftb3VudCAtIGJhc2Uub3B0aW9ucy5pdGVtcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uID0gJChcIjxkaXYvPlwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImNsYXNzXCIgOiBcIm93bC1wYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b25Jbm5lciA9ICQoXCI8c3Bhbj48L3NwYW4+XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGV4dFwiOiBiYXNlLm9wdGlvbnMucGFnaW5hdGlvbk51bWJlcnMgPT09IHRydWUgPyBjb3VudGVyIDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2xhc3NcIjogYmFzZS5vcHRpb25zLnBhZ2luYXRpb25OdW1iZXJzID09PSB0cnVlID8gXCJvd2wtbnVtYmVyc1wiIDogXCJcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcGFnaW5hdGlvbkJ1dHRvbi5hcHBlbmQocGFnaW5hdGlvbkJ1dHRvbklubmVyKTtcblxuICAgICAgICAgICAgICAgICAgICBwYWdpbmF0aW9uQnV0dG9uLmRhdGEoXCJvd2wtcGFnZVwiLCBsYXN0UGFnZSA9PT0gaSA/IGxhc3RJdGVtIDogaSk7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2luYXRpb25CdXR0b24uZGF0YShcIm93bC1yb3VuZFBhZ2VzXCIsIGNvdW50ZXIpO1xuXG4gICAgICAgICAgICAgICAgICAgIGJhc2UucGFnaW5hdGlvbldyYXBwZXIuYXBwZW5kKHBhZ2luYXRpb25CdXR0b24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuY2hlY2tQYWdpbmF0aW9uKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNoZWNrUGFnaW5hdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucGFnaW5hdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLnBhZ2luYXRpb25XcmFwcGVyLmZpbmQoXCIub3dsLXBhZ2VcIikuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCQodGhpcykuZGF0YShcIm93bC1yb3VuZFBhZ2VzXCIpID09PSAkKGJhc2UuJG93bEl0ZW1zW2Jhc2UuY3VycmVudEl0ZW1dKS5kYXRhKFwib3dsLXJvdW5kUGFnZXNcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5wYWdpbmF0aW9uV3JhcHBlclxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbmQoXCIub3dsLXBhZ2VcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjaGVja05hdmlnYXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubmF2aWdhdGlvbiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnJld2luZE5hdiA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5jdXJyZW50SXRlbSA9PT0gMCAmJiBiYXNlLm1heGltdW1JdGVtID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uUHJldi5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvbk5leHQuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UuY3VycmVudEl0ZW0gPT09IDAgJiYgYmFzZS5tYXhpbXVtSXRlbSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvblByZXYuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25OZXh0LnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChiYXNlLmN1cnJlbnRJdGVtID09PSBiYXNlLm1heGltdW1JdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuYnV0dG9uUHJldi5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvbk5leHQuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UuY3VycmVudEl0ZW0gIT09IDAgJiYgYmFzZS5jdXJyZW50SXRlbSAhPT0gYmFzZS5tYXhpbXVtSXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmJ1dHRvblByZXYucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5idXR0b25OZXh0LnJlbW92ZUNsYXNzKFwiZGlzYWJsZWRcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZUNvbnRyb2xzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS51cGRhdGVQYWdpbmF0aW9uKCk7XG4gICAgICAgICAgICBiYXNlLmNoZWNrTmF2aWdhdGlvbigpO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3dsQ29udHJvbHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLml0ZW1zID49IGJhc2UuaXRlbXNBbW91bnQpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3lDb250cm9scyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLm93bENvbnRyb2xzKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0IDogZnVuY3Rpb24gKHNwZWVkKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmIChiYXNlLmlzVHJhbnNpdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSArPSBiYXNlLm9wdGlvbnMuc2Nyb2xsUGVyUGFnZSA9PT0gdHJ1ZSA/IGJhc2Uub3B0aW9ucy5pdGVtcyA6IDE7XG4gICAgICAgICAgICBpZiAoYmFzZS5jdXJyZW50SXRlbSA+IGJhc2UubWF4aW11bUl0ZW0gKyAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUgPyAoYmFzZS5vcHRpb25zLml0ZW1zIC0gMSkgOiAwKSkge1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucmV3aW5kTmF2ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBzcGVlZCA9IFwicmV3aW5kXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmdvVG8oYmFzZS5jdXJyZW50SXRlbSwgc3BlZWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByZXYgOiBmdW5jdGlvbiAoc3BlZWQpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKGJhc2UuaXNUcmFuc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUgJiYgYmFzZS5jdXJyZW50SXRlbSA+IDAgJiYgYmFzZS5jdXJyZW50SXRlbSA8IGJhc2Uub3B0aW9ucy5pdGVtcykge1xuICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtIC09IGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlID8gYmFzZS5vcHRpb25zLml0ZW1zIDogMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiYXNlLmN1cnJlbnRJdGVtIDwgMCkge1xuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMucmV3aW5kTmF2ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBiYXNlLm1heGltdW1JdGVtO1xuICAgICAgICAgICAgICAgICAgICBzcGVlZCA9IFwicmV3aW5kXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmdvVG8oYmFzZS5jdXJyZW50SXRlbSwgc3BlZWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdvVG8gOiBmdW5jdGlvbiAocG9zaXRpb24sIHNwZWVkLCBkcmFnKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZ29Ub1BpeGVsO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5pc1RyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIGJhc2Uub3B0aW9ucy5iZWZvcmVNb3ZlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuYmVmb3JlTW92ZS5hcHBseSh0aGlzLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvc2l0aW9uID49IGJhc2UubWF4aW11bUl0ZW0pIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBvc2l0aW9uIDw9IDApIHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbiA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBiYXNlLm93bC5jdXJyZW50SXRlbSA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy50cmFuc2l0aW9uU3R5bGUgIT09IGZhbHNlICYmIGRyYWcgIT09IFwiZHJhZ1wiICYmIGJhc2Uub3B0aW9ucy5pdGVtcyA9PT0gMSAmJiBiYXNlLmJyb3dzZXIuc3VwcG9ydDNkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5zd2FwU3BlZWQoMCk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5zdXBwb3J0M2QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS50cmFuc2l0aW9uM2QoYmFzZS5wb3NpdGlvbnNJbkFycmF5W3Bvc2l0aW9uXSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jc3Myc2xpZGUoYmFzZS5wb3NpdGlvbnNJbkFycmF5W3Bvc2l0aW9uXSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJhc2UuYWZ0ZXJHbygpO1xuICAgICAgICAgICAgICAgIGJhc2Uuc2luZ2xlSXRlbVRyYW5zaXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnb1RvUGl4ZWwgPSBiYXNlLnBvc2l0aW9uc0luQXJyYXlbcG9zaXRpb25dO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5icm93c2VyLnN1cHBvcnQzZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuaXNDc3MzRmluaXNoID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3BlZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5zd2FwU3BlZWQoXCJwYWdpbmF0aW9uU3BlZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuaXNDc3MzRmluaXNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgYmFzZS5vcHRpb25zLnBhZ2luYXRpb25TcGVlZCk7XG5cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNwZWVkID09PSBcInJld2luZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uuc3dhcFNwZWVkKGJhc2Uub3B0aW9ucy5yZXdpbmRTcGVlZCk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuaXNDc3MzRmluaXNoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSwgYmFzZS5vcHRpb25zLnJld2luZFNwZWVkKTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uuc3dhcFNwZWVkKFwic2xpZGVTcGVlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5pc0NzczNGaW5pc2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9LCBiYXNlLm9wdGlvbnMuc2xpZGVTcGVlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJhc2UudHJhbnNpdGlvbjNkKGdvVG9QaXhlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChzcGVlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNzczJzbGlkZShnb1RvUGl4ZWwsIGJhc2Uub3B0aW9ucy5wYWdpbmF0aW9uU3BlZWQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc3BlZWQgPT09IFwicmV3aW5kXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jc3Myc2xpZGUoZ29Ub1BpeGVsLCBiYXNlLm9wdGlvbnMucmV3aW5kU3BlZWQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3NzMnNsaWRlKGdvVG9QaXhlbCwgYmFzZS5vcHRpb25zLnNsaWRlU3BlZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuYWZ0ZXJHbygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGp1bXBUbyA6IGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYmVmb3JlTW92ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmJlZm9yZU1vdmUuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwb3NpdGlvbiA+PSBiYXNlLm1heGltdW1JdGVtIHx8IHBvc2l0aW9uID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gYmFzZS5tYXhpbXVtSXRlbTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocG9zaXRpb24gPD0gMCkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2Uuc3dhcFNwZWVkKDApO1xuICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5zdXBwb3J0M2QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBiYXNlLnRyYW5zaXRpb24zZChiYXNlLnBvc2l0aW9uc0luQXJyYXlbcG9zaXRpb25dKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5jc3Myc2xpZGUoYmFzZS5wb3NpdGlvbnNJbkFycmF5W3Bvc2l0aW9uXSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gYmFzZS5vd2wuY3VycmVudEl0ZW0gPSBwb3NpdGlvbjtcbiAgICAgICAgICAgIGJhc2UuYWZ0ZXJHbygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFmdGVyR28gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG5cbiAgICAgICAgICAgIGJhc2UucHJldkFyci5wdXNoKGJhc2UuY3VycmVudEl0ZW0pO1xuICAgICAgICAgICAgYmFzZS5wcmV2SXRlbSA9IGJhc2Uub3dsLnByZXZJdGVtID0gYmFzZS5wcmV2QXJyW2Jhc2UucHJldkFyci5sZW5ndGggLSAyXTtcbiAgICAgICAgICAgIGJhc2UucHJldkFyci5zaGlmdCgwKTtcblxuICAgICAgICAgICAgaWYgKGJhc2UucHJldkl0ZW0gIT09IGJhc2UuY3VycmVudEl0ZW0pIHtcbiAgICAgICAgICAgICAgICBiYXNlLmNoZWNrUGFnaW5hdGlvbigpO1xuICAgICAgICAgICAgICAgIGJhc2UuY2hlY2tOYXZpZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgYmFzZS5lYWNoTW92ZVVwZGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5hdXRvUGxheSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jaGVja0FwKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYWZ0ZXJNb3ZlID09PSBcImZ1bmN0aW9uXCIgJiYgYmFzZS5wcmV2SXRlbSAhPT0gYmFzZS5jdXJyZW50SXRlbSkge1xuICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hZnRlck1vdmUuYXBwbHkodGhpcywgW2Jhc2UuJGVsZW1dKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS5hcFN0YXR1cyA9IFwic3RvcFwiO1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5hdXRvUGxheUludGVydmFsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjaGVja0FwIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2UuYXBTdGF0dXMgIT09IFwic3RvcFwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5wbGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGxheSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuYXBTdGF0dXMgPSBcInBsYXlcIjtcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwoYmFzZS5hdXRvUGxheUludGVydmFsKTtcbiAgICAgICAgICAgIGJhc2UuYXV0b1BsYXlJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXh0KHRydWUpO1xuICAgICAgICAgICAgfSwgYmFzZS5vcHRpb25zLmF1dG9QbGF5KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzd2FwU3BlZWQgOiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSBcInNsaWRlU3BlZWRcIikge1xuICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKGJhc2UuYWRkQ3NzU3BlZWQoYmFzZS5vcHRpb25zLnNsaWRlU3BlZWQpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWN0aW9uID09PSBcInBhZ2luYXRpb25TcGVlZFwiKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5jc3MoYmFzZS5hZGRDc3NTcGVlZChiYXNlLm9wdGlvbnMucGFnaW5hdGlvblNwZWVkKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhY3Rpb24gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmNzcyhiYXNlLmFkZENzc1NwZWVkKGFjdGlvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGFkZENzc1NwZWVkIDogZnVuY3Rpb24gKHNwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwiLXdlYmtpdC10cmFuc2l0aW9uXCI6IFwiYWxsIFwiICsgc3BlZWQgKyBcIm1zIGVhc2VcIixcbiAgICAgICAgICAgICAgICBcIi1tb3otdHJhbnNpdGlvblwiOiBcImFsbCBcIiArIHNwZWVkICsgXCJtcyBlYXNlXCIsXG4gICAgICAgICAgICAgICAgXCItby10cmFuc2l0aW9uXCI6IFwiYWxsIFwiICsgc3BlZWQgKyBcIm1zIGVhc2VcIixcbiAgICAgICAgICAgICAgICBcInRyYW5zaXRpb25cIjogXCJhbGwgXCIgKyBzcGVlZCArIFwibXMgZWFzZVwiXG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZVRyYW5zaXRpb24gOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIFwiLXdlYmtpdC10cmFuc2l0aW9uXCI6IFwiXCIsXG4gICAgICAgICAgICAgICAgXCItbW96LXRyYW5zaXRpb25cIjogXCJcIixcbiAgICAgICAgICAgICAgICBcIi1vLXRyYW5zaXRpb25cIjogXCJcIixcbiAgICAgICAgICAgICAgICBcInRyYW5zaXRpb25cIjogXCJcIlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBkb1RyYW5zbGF0ZSA6IGZ1bmN0aW9uIChwaXhlbHMpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgXCItd2Via2l0LXRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZTNkKFwiICsgcGl4ZWxzICsgXCJweCwgMHB4LCAwcHgpXCIsXG4gICAgICAgICAgICAgICAgXCItbW96LXRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZTNkKFwiICsgcGl4ZWxzICsgXCJweCwgMHB4LCAwcHgpXCIsXG4gICAgICAgICAgICAgICAgXCItby10cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGUzZChcIiArIHBpeGVscyArIFwicHgsIDBweCwgMHB4KVwiLFxuICAgICAgICAgICAgICAgIFwiLW1zLXRyYW5zZm9ybVwiOiBcInRyYW5zbGF0ZTNkKFwiICsgcGl4ZWxzICsgXCJweCwgMHB4LCAwcHgpXCIsXG4gICAgICAgICAgICAgICAgXCJ0cmFuc2Zvcm1cIjogXCJ0cmFuc2xhdGUzZChcIiArIHBpeGVscyArIFwicHgsIDBweCwwcHgpXCJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJhbnNpdGlvbjNkIDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLmNzcyhiYXNlLmRvVHJhbnNsYXRlKHZhbHVlKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3NzMm1vdmUgOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIuY3NzKHtcImxlZnRcIiA6IHZhbHVlfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3NzMnNsaWRlIDogZnVuY3Rpb24gKHZhbHVlLCBzcGVlZCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuXG4gICAgICAgICAgICBiYXNlLmlzQ3NzRmluaXNoID0gZmFsc2U7XG4gICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLnN0b3AodHJ1ZSwgdHJ1ZSkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgXCJsZWZ0XCIgOiB2YWx1ZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGR1cmF0aW9uIDogc3BlZWQgfHwgYmFzZS5vcHRpb25zLnNsaWRlU3BlZWQsXG4gICAgICAgICAgICAgICAgY29tcGxldGUgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuaXNDc3NGaW5pc2ggPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNoZWNrQnJvd3NlciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGUzRCA9IFwidHJhbnNsYXRlM2QoMHB4LCAwcHgsIDBweClcIixcbiAgICAgICAgICAgICAgICB0ZW1wRWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksXG4gICAgICAgICAgICAgICAgcmVnZXgsXG4gICAgICAgICAgICAgICAgYXNTdXBwb3J0LFxuICAgICAgICAgICAgICAgIHN1cHBvcnQzZCxcbiAgICAgICAgICAgICAgICBpc1RvdWNoO1xuXG4gICAgICAgICAgICB0ZW1wRWxlbS5zdHlsZS5jc3NUZXh0ID0gXCIgIC1tb3otdHJhbnNmb3JtOlwiICsgdHJhbnNsYXRlM0QgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOyAtbXMtdHJhbnNmb3JtOlwiICAgICArIHRyYW5zbGF0ZTNEICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjsgLW8tdHJhbnNmb3JtOlwiICAgICAgKyB0cmFuc2xhdGUzRCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI7IC13ZWJraXQtdHJhbnNmb3JtOlwiICsgdHJhbnNsYXRlM0QgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiOyB0cmFuc2Zvcm06XCIgICAgICAgICArIHRyYW5zbGF0ZTNEO1xuICAgICAgICAgICAgcmVnZXggPSAvdHJhbnNsYXRlM2RcXCgwcHgsIDBweCwgMHB4XFwpL2c7XG4gICAgICAgICAgICBhc1N1cHBvcnQgPSB0ZW1wRWxlbS5zdHlsZS5jc3NUZXh0Lm1hdGNoKHJlZ2V4KTtcbiAgICAgICAgICAgIHN1cHBvcnQzZCA9IChhc1N1cHBvcnQgIT09IG51bGwgJiYgYXNTdXBwb3J0Lmxlbmd0aCA9PT0gMSk7XG5cbiAgICAgICAgICAgIGlzVG91Y2ggPSBcIm9udG91Y2hzdGFydFwiIGluIHdpbmRvdyB8fCB3aW5kb3cubmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHM7XG5cbiAgICAgICAgICAgIGJhc2UuYnJvd3NlciA9IHtcbiAgICAgICAgICAgICAgICBcInN1cHBvcnQzZFwiIDogc3VwcG9ydDNkLFxuICAgICAgICAgICAgICAgIFwiaXNUb3VjaFwiIDogaXNUb3VjaFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRXZlbnRzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5tb3VzZURyYWcgIT09IGZhbHNlIHx8IGJhc2Uub3B0aW9ucy50b3VjaERyYWcgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5nZXN0dXJlcygpO1xuICAgICAgICAgICAgICAgIGJhc2UuZGlzYWJsZWRFdmVudHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBldmVudFR5cGVzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHR5cGVzID0gW1wic1wiLCBcImVcIiwgXCJ4XCJdO1xuXG4gICAgICAgICAgICBiYXNlLmV2X3R5cGVzID0ge307XG5cbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMubW91c2VEcmFnID09PSB0cnVlICYmIGJhc2Uub3B0aW9ucy50b3VjaERyYWcgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgXCJ0b3VjaHN0YXJ0Lm93bCBtb3VzZWRvd24ub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2htb3ZlLm93bCBtb3VzZW1vdmUub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2hlbmQub3dsIHRvdWNoY2FuY2VsLm93bCBtb3VzZXVwLm93bFwiXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYmFzZS5vcHRpb25zLm1vdXNlRHJhZyA9PT0gZmFsc2UgJiYgYmFzZS5vcHRpb25zLnRvdWNoRHJhZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHR5cGVzID0gW1xuICAgICAgICAgICAgICAgICAgICBcInRvdWNoc3RhcnQub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwidG91Y2htb3ZlLm93bFwiLFxuICAgICAgICAgICAgICAgICAgICBcInRvdWNoZW5kLm93bCB0b3VjaGNhbmNlbC5vd2xcIlxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2Uub3B0aW9ucy5tb3VzZURyYWcgPT09IHRydWUgJiYgYmFzZS5vcHRpb25zLnRvdWNoRHJhZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0eXBlcyA9IFtcbiAgICAgICAgICAgICAgICAgICAgXCJtb3VzZWRvd24ub3dsXCIsXG4gICAgICAgICAgICAgICAgICAgIFwibW91c2Vtb3ZlLm93bFwiLFxuICAgICAgICAgICAgICAgICAgICBcIm1vdXNldXAub3dsXCJcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBiYXNlLmV2X3R5cGVzLnN0YXJ0ID0gdHlwZXNbMF07XG4gICAgICAgICAgICBiYXNlLmV2X3R5cGVzLm1vdmUgPSB0eXBlc1sxXTtcbiAgICAgICAgICAgIGJhc2UuZXZfdHlwZXMuZW5kID0gdHlwZXNbMl07XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZWRFdmVudHMgOiAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcImRyYWdzdGFydC5vd2xcIiwgZnVuY3Rpb24gKGV2ZW50KSB7IGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm1vdXNlZG93bi5kaXNhYmxlVGV4dFNlbGVjdFwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkKGUudGFyZ2V0KS5pcygnaW5wdXQsIHRleHRhcmVhLCBzZWxlY3QsIG9wdGlvbicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2VzdHVyZXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKmpzbGludCB1bnBhcmFtOiB0cnVlKi9cbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBsb2NhbHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldFggOiAwLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRZIDogMCxcbiAgICAgICAgICAgICAgICAgICAgYmFzZUVsV2lkdGggOiAwLFxuICAgICAgICAgICAgICAgICAgICByZWxhdGl2ZVBvcyA6IDAsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBtaW5Td2lwZSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIG1heFN3aXBlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBzbGlkaW5nIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZGFyZ2dpbmc6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEVsZW1lbnQgOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgYmFzZS5pc0Nzc0ZpbmlzaCA9IHRydWU7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldFRvdWNoZXMoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4IDogZXZlbnQudG91Y2hlc1swXS5wYWdlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgOiBldmVudC50b3VjaGVzWzBdLnBhZ2VZXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQucGFnZVggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4IDogZXZlbnQucGFnZVgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeSA6IGV2ZW50LnBhZ2VZXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5wYWdlWCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggOiBldmVudC5jbGllbnRYLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHkgOiBldmVudC5jbGllbnRZXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzd2FwRXZlbnRzKHR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gXCJvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKGJhc2UuZXZfdHlwZXMubW92ZSwgZHJhZ01vdmUpO1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vbihiYXNlLmV2X3R5cGVzLmVuZCwgZHJhZ0VuZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm9mZlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihiYXNlLmV2X3R5cGVzLm1vdmUpO1xuICAgICAgICAgICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoYmFzZS5ldl90eXBlcy5lbmQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZHJhZ1N0YXJ0KGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIGV2ID0gZXZlbnQub3JpZ2luYWxFdmVudCB8fCBldmVudCB8fCB3aW5kb3cuZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgICAgICAgICAgaWYgKGV2LndoaWNoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuaXRlbXNBbW91bnQgPD0gYmFzZS5vcHRpb25zLml0ZW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuaXNDc3NGaW5pc2ggPT09IGZhbHNlICYmICFiYXNlLm9wdGlvbnMuZHJhZ0JlZm9yZUFuaW1GaW5pc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5pc0NzczNGaW5pc2ggPT09IGZhbHNlICYmICFiYXNlLm9wdGlvbnMuZHJhZ0JlZm9yZUFuaW1GaW5pc2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuYXV0b1BsYXkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuYXV0b1BsYXlJbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5pc1RvdWNoICE9PSB0cnVlICYmICFiYXNlLiRvd2xXcmFwcGVyLmhhc0NsYXNzKFwiZ3JhYmJpbmdcIikpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci5hZGRDbGFzcyhcImdyYWJiaW5nXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJhc2UubmV3UG9zWCA9IDA7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXdSZWxhdGl2ZVggPSAwO1xuXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jc3MoYmFzZS5yZW1vdmVUcmFuc2l0aW9uKCkpO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSAkKHRoaXMpLnBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgbG9jYWxzLnJlbGF0aXZlUG9zID0gcG9zaXRpb24ubGVmdDtcblxuICAgICAgICAgICAgICAgIGxvY2Fscy5vZmZzZXRYID0gZ2V0VG91Y2hlcyhldikueCAtIHBvc2l0aW9uLmxlZnQ7XG4gICAgICAgICAgICAgICAgbG9jYWxzLm9mZnNldFkgPSBnZXRUb3VjaGVzKGV2KS55IC0gcG9zaXRpb24udG9wO1xuXG4gICAgICAgICAgICAgICAgc3dhcEV2ZW50cyhcIm9uXCIpO1xuXG4gICAgICAgICAgICAgICAgbG9jYWxzLnNsaWRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsb2NhbHMudGFyZ2V0RWxlbWVudCA9IGV2LnRhcmdldCB8fCBldi5zcmNFbGVtZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmFnTW92ZShldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBldiA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQgfHwgZXZlbnQgfHwgd2luZG93LmV2ZW50LFxuICAgICAgICAgICAgICAgICAgICBtaW5Td2lwZSxcbiAgICAgICAgICAgICAgICAgICAgbWF4U3dpcGU7XG5cbiAgICAgICAgICAgICAgICBiYXNlLm5ld1Bvc1ggPSBnZXRUb3VjaGVzKGV2KS54IC0gbG9jYWxzLm9mZnNldFg7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXdQb3NZID0gZ2V0VG91Y2hlcyhldikueSAtIGxvY2Fscy5vZmZzZXRZO1xuICAgICAgICAgICAgICAgIGJhc2UubmV3UmVsYXRpdmVYID0gYmFzZS5uZXdQb3NYIC0gbG9jYWxzLnJlbGF0aXZlUG9zO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuc3RhcnREcmFnZ2luZyA9PT0gXCJmdW5jdGlvblwiICYmIGxvY2Fscy5kcmFnZ2luZyAhPT0gdHJ1ZSAmJiBiYXNlLm5ld1JlbGF0aXZlWCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbHMuZHJhZ2dpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wdGlvbnMuc3RhcnREcmFnZ2luZy5hcHBseShiYXNlLCBbYmFzZS4kZWxlbV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICgoYmFzZS5uZXdSZWxhdGl2ZVggPiA4IHx8IGJhc2UubmV3UmVsYXRpdmVYIDwgLTgpICYmIChiYXNlLmJyb3dzZXIuaXNUb3VjaCA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2LnByZXZlbnREZWZhdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldi5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxvY2Fscy5zbGlkaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoKGJhc2UubmV3UG9zWSA+IDEwIHx8IGJhc2UubmV3UG9zWSA8IC0xMCkgJiYgbG9jYWxzLnNsaWRpbmcgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihcInRvdWNobW92ZS5vd2xcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbWluU3dpcGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLm5ld1JlbGF0aXZlWCAvIDU7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIG1heFN3aXBlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5tYXhpbXVtUGl4ZWxzICsgYmFzZS5uZXdSZWxhdGl2ZVggLyA1O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBiYXNlLm5ld1Bvc1ggPSBNYXRoLm1heChNYXRoLm1pbihiYXNlLm5ld1Bvc1gsIG1pblN3aXBlKCkpLCBtYXhTd2lwZSgpKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5icm93c2VyLnN1cHBvcnQzZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnRyYW5zaXRpb24zZChiYXNlLm5ld1Bvc1gpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuY3NzMm1vdmUoYmFzZS5uZXdQb3NYKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYWdFbmQoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXYgPSBldmVudC5vcmlnaW5hbEV2ZW50IHx8IGV2ZW50IHx8IHdpbmRvdy5ldmVudCxcbiAgICAgICAgICAgICAgICAgICAgbmV3UG9zaXRpb24sXG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXJzLFxuICAgICAgICAgICAgICAgICAgICBvd2xTdG9wRXZlbnQ7XG5cbiAgICAgICAgICAgICAgICBldi50YXJnZXQgPSBldi50YXJnZXQgfHwgZXYuc3JjRWxlbWVudDtcblxuICAgICAgICAgICAgICAgIGxvY2Fscy5kcmFnZ2luZyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuYnJvd3Nlci5pc1RvdWNoICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXIucmVtb3ZlQ2xhc3MoXCJncmFiYmluZ1wiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5uZXdSZWxhdGl2ZVggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UuZHJhZ0RpcmVjdGlvbiA9IGJhc2Uub3dsLmRyYWdEaXJlY3Rpb24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmRyYWdEaXJlY3Rpb24gPSBiYXNlLm93bC5kcmFnRGlyZWN0aW9uID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChiYXNlLm5ld1JlbGF0aXZlWCAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IGJhc2UuZ2V0TmV3UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5nb1RvKG5ld1Bvc2l0aW9uLCBmYWxzZSwgXCJkcmFnXCIpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobG9jYWxzLnRhcmdldEVsZW1lbnQgPT09IGV2LnRhcmdldCAmJiBiYXNlLmJyb3dzZXIuaXNUb3VjaCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChldi50YXJnZXQpLm9uKFwiY2xpY2suZGlzYWJsZVwiLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldi5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoZXYudGFyZ2V0KS5vZmYoXCJjbGljay5kaXNhYmxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVycyA9ICQuX2RhdGEoZXYudGFyZ2V0LCBcImV2ZW50c1wiKS5jbGljaztcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bFN0b3BFdmVudCA9IGhhbmRsZXJzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlcnMuc3BsaWNlKDAsIDAsIG93bFN0b3BFdmVudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3dhcEV2ZW50cyhcIm9mZlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oYmFzZS5ldl90eXBlcy5zdGFydCwgXCIub3dsLXdyYXBwZXJcIiwgZHJhZ1N0YXJ0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXROZXdQb3NpdGlvbiA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbiA9IGJhc2UuY2xvc2VzdEl0ZW0oKTtcblxuICAgICAgICAgICAgaWYgKG5ld1Bvc2l0aW9uID4gYmFzZS5tYXhpbXVtSXRlbSkge1xuICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSBiYXNlLm1heGltdW1JdGVtO1xuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9uICA9IGJhc2UubWF4aW11bUl0ZW07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGJhc2UubmV3UG9zWCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIGJhc2UuY3VycmVudEl0ZW0gPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ld1Bvc2l0aW9uO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZXN0SXRlbSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhcnJheSA9IGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlID8gYmFzZS5wYWdlc0luQXJyYXkgOiBiYXNlLnBvc2l0aW9uc0luQXJyYXksXG4gICAgICAgICAgICAgICAgZ29hbCA9IGJhc2UubmV3UG9zWCxcbiAgICAgICAgICAgICAgICBjbG9zZXN0ID0gbnVsbDtcblxuICAgICAgICAgICAgJC5lYWNoKGFycmF5LCBmdW5jdGlvbiAoaSwgdikge1xuICAgICAgICAgICAgICAgIGlmIChnb2FsIC0gKGJhc2UuaXRlbVdpZHRoIC8gMjApID4gYXJyYXlbaSArIDFdICYmIGdvYWwgLSAoYmFzZS5pdGVtV2lkdGggLyAyMCkgPCB2ICYmIGJhc2UubW92ZURpcmVjdGlvbigpID09PSBcImxlZnRcIikge1xuICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gdjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5zY3JvbGxQZXJQYWdlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gJC5pbkFycmF5KGNsb3Nlc3QsIGJhc2UucG9zaXRpb25zSW5BcnJheSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gaTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZ29hbCArIChiYXNlLml0ZW1XaWR0aCAvIDIwKSA8IHYgJiYgZ29hbCArIChiYXNlLml0ZW1XaWR0aCAvIDIwKSA+IChhcnJheVtpICsgMV0gfHwgYXJyYXlbaV0gLSBiYXNlLml0ZW1XaWR0aCkgJiYgYmFzZS5tb3ZlRGlyZWN0aW9uKCkgPT09IFwicmlnaHRcIikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLnNjcm9sbFBlclBhZ2UgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QgPSBhcnJheVtpICsgMV0gfHwgYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmN1cnJlbnRJdGVtID0gJC5pbkFycmF5KGNsb3Nlc3QsIGJhc2UucG9zaXRpb25zSW5BcnJheSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZXN0ID0gYXJyYXlbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5jdXJyZW50SXRlbSA9IGkgKyAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gYmFzZS5jdXJyZW50SXRlbTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlRGlyZWN0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbjtcbiAgICAgICAgICAgIGlmIChiYXNlLm5ld1JlbGF0aXZlWCA8IDApIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICAgICAgYmFzZS5wbGF5RGlyZWN0aW9uID0gXCJuZXh0XCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIGJhc2UucGxheURpcmVjdGlvbiA9IFwicHJldlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGRpcmVjdGlvbjtcbiAgICAgICAgfSxcblxuICAgICAgICBjdXN0b21FdmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKmpzbGludCB1bnBhcmFtOiB0cnVlKi9cbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wubmV4dFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5uZXh0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wucHJldlwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5wcmV2KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJvd2wucGxheVwiLCBmdW5jdGlvbiAoZXZlbnQsIHNwZWVkKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5vcHRpb25zLmF1dG9QbGF5ID0gc3BlZWQ7XG4gICAgICAgICAgICAgICAgYmFzZS5wbGF5KCk7XG4gICAgICAgICAgICAgICAgYmFzZS5ob3ZlclN0YXR1cyA9IFwicGxheVwiO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwib3dsLnN0b3BcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGJhc2Uuc3RvcCgpO1xuICAgICAgICAgICAgICAgIGJhc2UuaG92ZXJTdGF0dXMgPSBcInN0b3BcIjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm93bC5nb1RvXCIsIGZ1bmN0aW9uIChldmVudCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIGJhc2UuZ29UbyhpdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS4kZWxlbS5vbihcIm93bC5qdW1wVG9cIiwgZnVuY3Rpb24gKGV2ZW50LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5qdW1wVG8oaXRlbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdG9wT25Ib3ZlciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLm9wdGlvbnMuc3RvcE9uSG92ZXIgPT09IHRydWUgJiYgYmFzZS5icm93c2VyLmlzVG91Y2ggIT09IHRydWUgJiYgYmFzZS5vcHRpb25zLmF1dG9QbGF5ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGJhc2UuJGVsZW0ub24oXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBiYXNlLiRlbGVtLm9uKFwibW91c2VvdXRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFzZS5ob3ZlclN0YXR1cyAhPT0gXCJzdG9wXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UucGxheSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGF6eUxvYWQgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICAkaXRlbSxcbiAgICAgICAgICAgICAgICBpdGVtTnVtYmVyLFxuICAgICAgICAgICAgICAgICRsYXp5SW1nLFxuICAgICAgICAgICAgICAgIGZvbGxvdztcblxuICAgICAgICAgICAgaWYgKGJhc2Uub3B0aW9ucy5sYXp5TG9hZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYmFzZS5pdGVtc0Ftb3VudDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgJGl0ZW0gPSAkKGJhc2UuJG93bEl0ZW1zW2ldKTtcblxuICAgICAgICAgICAgICAgIGlmICgkaXRlbS5kYXRhKFwib3dsLWxvYWRlZFwiKSA9PT0gXCJsb2FkZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpdGVtTnVtYmVyID0gJGl0ZW0uZGF0YShcIm93bC1pdGVtXCIpO1xuICAgICAgICAgICAgICAgICRsYXp5SW1nID0gJGl0ZW0uZmluZChcIi5sYXp5T3dsXCIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAkbGF6eUltZy5kYXRhKFwic3JjXCIpICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICRpdGVtLmRhdGEoXCJvd2wtbG9hZGVkXCIsIFwibG9hZGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCRpdGVtLmRhdGEoXCJvd2wtbG9hZGVkXCIpID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgJGxhenlJbWcuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAkaXRlbS5hZGRDbGFzcyhcImxvYWRpbmdcIikuZGF0YShcIm93bC1sb2FkZWRcIiwgXCJjaGVja2VkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmxhenlGb2xsb3cgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9sbG93ID0gaXRlbU51bWJlciA+PSBiYXNlLmN1cnJlbnRJdGVtO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvbGxvdyA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChmb2xsb3cgJiYgaXRlbU51bWJlciA8IGJhc2UuY3VycmVudEl0ZW0gKyBiYXNlLm9wdGlvbnMuaXRlbXMgJiYgJGxhenlJbWcubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UubGF6eVByZWxvYWQoJGl0ZW0sICRsYXp5SW1nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbGF6eVByZWxvYWQgOiBmdW5jdGlvbiAoJGl0ZW0sICRsYXp5SW1nKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXMsXG4gICAgICAgICAgICAgICAgaXRlcmF0aW9ucyA9IDAsXG4gICAgICAgICAgICAgICAgaXNCYWNrZ3JvdW5kSW1nO1xuXG4gICAgICAgICAgICBpZiAoJGxhenlJbWcucHJvcChcInRhZ05hbWVcIikgPT09IFwiRElWXCIpIHtcbiAgICAgICAgICAgICAgICAkbGF6eUltZy5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwidXJsKFwiICsgJGxhenlJbWcuZGF0YShcInNyY1wiKSArIFwiKVwiKTtcbiAgICAgICAgICAgICAgICBpc0JhY2tncm91bmRJbWcgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkbGF6eUltZ1swXS5zcmMgPSAkbGF6eUltZy5kYXRhKFwic3JjXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzaG93SW1hZ2UoKSB7XG4gICAgICAgICAgICAgICAgJGl0ZW0uZGF0YShcIm93bC1sb2FkZWRcIiwgXCJsb2FkZWRcIikucmVtb3ZlQ2xhc3MoXCJsb2FkaW5nXCIpO1xuICAgICAgICAgICAgICAgICRsYXp5SW1nLnJlbW92ZUF0dHIoXCJkYXRhLXNyY1wiKTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmxhenlFZmZlY3QgPT09IFwiZmFkZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICRsYXp5SW1nLmZhZGVJbig0MDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRsYXp5SW1nLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBiYXNlLm9wdGlvbnMuYWZ0ZXJMYXp5TG9hZCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uub3B0aW9ucy5hZnRlckxhenlMb2FkLmFwcGx5KHRoaXMsIFtiYXNlLiRlbGVtXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja0xhenlJbWFnZSgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRpb25zICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2UuY29tcGxldGVJbWcoJGxhenlJbWcuZ2V0KDApKSB8fCBpc0JhY2tncm91bmRJbWcgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvd0ltYWdlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVyYXRpb25zIDw9IDEwMCkgey8vaWYgaW1hZ2UgbG9hZHMgaW4gbGVzcyB0aGFuIDEwIHNlY29uZHMgXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNoZWNrTGF6eUltYWdlLCAxMDApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3dJbWFnZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hlY2tMYXp5SW1hZ2UoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhdXRvSGVpZ2h0IDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgICRjdXJyZW50aW1nID0gJChiYXNlLiRvd2xJdGVtc1tiYXNlLmN1cnJlbnRJdGVtXSkuZmluZChcImltZ1wiKSxcbiAgICAgICAgICAgICAgICBpdGVyYXRpb25zO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBhZGRIZWlnaHQoKSB7XG4gICAgICAgICAgICAgICAgdmFyICRjdXJyZW50SXRlbSA9ICQoYmFzZS4kb3dsSXRlbXNbYmFzZS5jdXJyZW50SXRlbV0pLmhlaWdodCgpO1xuICAgICAgICAgICAgICAgIGJhc2Uud3JhcHBlck91dGVyLmNzcyhcImhlaWdodFwiLCAkY3VycmVudEl0ZW0gKyBcInB4XCIpO1xuICAgICAgICAgICAgICAgIGlmICghYmFzZS53cmFwcGVyT3V0ZXIuaGFzQ2xhc3MoXCJhdXRvSGVpZ2h0XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2Uud3JhcHBlck91dGVyLmFkZENsYXNzKFwiYXV0b0hlaWdodFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGVja0ltYWdlKCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdGlvbnMgKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5jb21wbGV0ZUltZygkY3VycmVudGltZy5nZXQoMCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZEhlaWdodCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlcmF0aW9ucyA8PSAxMDApIHsgLy9pZiBpbWFnZSBsb2FkcyBpbiBsZXNzIHRoYW4gMTAgc2Vjb25kcyBcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2hlY2tJbWFnZSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLndyYXBwZXJPdXRlci5jc3MoXCJoZWlnaHRcIiwgXCJcIik7IC8vRWxzZSByZW1vdmUgaGVpZ2h0IGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCRjdXJyZW50aW1nLmdldCgwKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaXRlcmF0aW9ucyA9IDA7XG4gICAgICAgICAgICAgICAgY2hlY2tJbWFnZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRIZWlnaHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBjb21wbGV0ZUltZyA6IGZ1bmN0aW9uIChpbWcpIHtcbiAgICAgICAgICAgIHZhciBuYXR1cmFsV2lkdGhUeXBlO1xuXG4gICAgICAgICAgICBpZiAoIWltZy5jb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5hdHVyYWxXaWR0aFR5cGUgPSB0eXBlb2YgaW1nLm5hdHVyYWxXaWR0aDtcbiAgICAgICAgICAgIGlmIChuYXR1cmFsV2lkdGhUeXBlICE9PSBcInVuZGVmaW5lZFwiICYmIGltZy5uYXR1cmFsV2lkdGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBvblZpc2libGVJdGVtcyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmFkZENsYXNzQWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsSXRlbXMucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLnZpc2libGVJdGVtcyA9IFtdO1xuICAgICAgICAgICAgZm9yIChpID0gYmFzZS5jdXJyZW50SXRlbTsgaSA8IGJhc2UuY3VycmVudEl0ZW0gKyBiYXNlLm9wdGlvbnMuaXRlbXM7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGJhc2UudmlzaWJsZUl0ZW1zLnB1c2goaSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFzZS5vcHRpb25zLmFkZENsYXNzQWN0aXZlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICQoYmFzZS4kb3dsSXRlbXNbaV0pLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJhc2Uub3dsLnZpc2libGVJdGVtcyA9IGJhc2UudmlzaWJsZUl0ZW1zO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRyYW5zaXRpb25UeXBlcyA6IGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIC8vQ3VycmVudGx5IGF2YWlsYWJsZTogXCJmYWRlXCIsIFwiYmFja1NsaWRlXCIsIFwiZ29Eb3duXCIsIFwiZmFkZVVwXCJcbiAgICAgICAgICAgIGJhc2Uub3V0Q2xhc3MgPSBcIm93bC1cIiArIGNsYXNzTmFtZSArIFwiLW91dFwiO1xuICAgICAgICAgICAgYmFzZS5pbkNsYXNzID0gXCJvd2wtXCIgKyBjbGFzc05hbWUgKyBcIi1pblwiO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpbmdsZUl0ZW1UcmFuc2l0aW9uIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG91dENsYXNzID0gYmFzZS5vdXRDbGFzcyxcbiAgICAgICAgICAgICAgICBpbkNsYXNzID0gYmFzZS5pbkNsYXNzLFxuICAgICAgICAgICAgICAgICRjdXJyZW50SXRlbSA9IGJhc2UuJG93bEl0ZW1zLmVxKGJhc2UuY3VycmVudEl0ZW0pLFxuICAgICAgICAgICAgICAgICRwcmV2SXRlbSA9IGJhc2UuJG93bEl0ZW1zLmVxKGJhc2UucHJldkl0ZW0pLFxuICAgICAgICAgICAgICAgIHByZXZQb3MgPSBNYXRoLmFicyhiYXNlLnBvc2l0aW9uc0luQXJyYXlbYmFzZS5jdXJyZW50SXRlbV0pICsgYmFzZS5wb3NpdGlvbnNJbkFycmF5W2Jhc2UucHJldkl0ZW1dLFxuICAgICAgICAgICAgICAgIG9yaWdpbiA9IE1hdGguYWJzKGJhc2UucG9zaXRpb25zSW5BcnJheVtiYXNlLmN1cnJlbnRJdGVtXSkgKyBiYXNlLml0ZW1XaWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgYW5pbUVuZCA9ICd3ZWJraXRBbmltYXRpb25FbmQgb0FuaW1hdGlvbkVuZCBNU0FuaW1hdGlvbkVuZCBhbmltYXRpb25lbmQnO1xuXG4gICAgICAgICAgICBiYXNlLmlzVHJhbnNpdGlvbiA9IHRydWU7XG5cbiAgICAgICAgICAgIGJhc2UuJG93bFdyYXBwZXJcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoJ293bC1vcmlnaW4nKVxuICAgICAgICAgICAgICAgIC5jc3Moe1xuICAgICAgICAgICAgICAgICAgICBcIi13ZWJraXQtdHJhbnNmb3JtLW9yaWdpblwiIDogb3JpZ2luICsgXCJweFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi1tb3otcGVyc3BlY3RpdmUtb3JpZ2luXCIgOiBvcmlnaW4gKyBcInB4XCIsXG4gICAgICAgICAgICAgICAgICAgIFwicGVyc3BlY3RpdmUtb3JpZ2luXCIgOiBvcmlnaW4gKyBcInB4XCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIHRyYW5zU3R5bGVzKHByZXZQb3MpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBcInBvc2l0aW9uXCIgOiBcInJlbGF0aXZlXCIsXG4gICAgICAgICAgICAgICAgICAgIFwibGVmdFwiIDogcHJldlBvcyArIFwicHhcIlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRwcmV2SXRlbVxuICAgICAgICAgICAgICAgIC5jc3ModHJhbnNTdHlsZXMocHJldlBvcywgMTApKVxuICAgICAgICAgICAgICAgIC5hZGRDbGFzcyhvdXRDbGFzcylcbiAgICAgICAgICAgICAgICAub24oYW5pbUVuZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmVuZFByZXYgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAkcHJldkl0ZW0ub2ZmKGFuaW1FbmQpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLmNsZWFyVHJhbnNTdHlsZSgkcHJldkl0ZW0sIG91dENsYXNzKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJGN1cnJlbnRJdGVtXG4gICAgICAgICAgICAgICAgLmFkZENsYXNzKGluQ2xhc3MpXG4gICAgICAgICAgICAgICAgLm9uKGFuaW1FbmQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5lbmRDdXJyZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgJGN1cnJlbnRJdGVtLm9mZihhbmltRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5jbGVhclRyYW5zU3R5bGUoJGN1cnJlbnRJdGVtLCBpbkNsYXNzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhclRyYW5zU3R5bGUgOiBmdW5jdGlvbiAoaXRlbSwgY2xhc3NUb1JlbW92ZSkge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzO1xuICAgICAgICAgICAgaXRlbS5jc3Moe1xuICAgICAgICAgICAgICAgIFwicG9zaXRpb25cIiA6IFwiXCIsXG4gICAgICAgICAgICAgICAgXCJsZWZ0XCIgOiBcIlwiXG4gICAgICAgICAgICB9KS5yZW1vdmVDbGFzcyhjbGFzc1RvUmVtb3ZlKTtcblxuICAgICAgICAgICAgaWYgKGJhc2UuZW5kUHJldiAmJiBiYXNlLmVuZEN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiRvd2xXcmFwcGVyLnJlbW92ZUNsYXNzKCdvd2wtb3JpZ2luJyk7XG4gICAgICAgICAgICAgICAgYmFzZS5lbmRQcmV2ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5lbmRDdXJyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYmFzZS5pc1RyYW5zaXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvd2xTdGF0dXMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLm93bCA9IHtcbiAgICAgICAgICAgICAgICBcInVzZXJPcHRpb25zXCIgICA6IGJhc2UudXNlck9wdGlvbnMsXG4gICAgICAgICAgICAgICAgXCJiYXNlRWxlbWVudFwiICAgOiBiYXNlLiRlbGVtLFxuICAgICAgICAgICAgICAgIFwidXNlckl0ZW1zXCIgICAgIDogYmFzZS4kdXNlckl0ZW1zLFxuICAgICAgICAgICAgICAgIFwib3dsSXRlbXNcIiAgICAgIDogYmFzZS4kb3dsSXRlbXMsXG4gICAgICAgICAgICAgICAgXCJjdXJyZW50SXRlbVwiICAgOiBiYXNlLmN1cnJlbnRJdGVtLFxuICAgICAgICAgICAgICAgIFwicHJldkl0ZW1cIiAgICAgIDogYmFzZS5wcmV2SXRlbSxcbiAgICAgICAgICAgICAgICBcInZpc2libGVJdGVtc1wiICA6IGJhc2UudmlzaWJsZUl0ZW1zLFxuICAgICAgICAgICAgICAgIFwiaXNUb3VjaFwiICAgICAgIDogYmFzZS5icm93c2VyLmlzVG91Y2gsXG4gICAgICAgICAgICAgICAgXCJicm93c2VyXCIgICAgICAgOiBiYXNlLmJyb3dzZXIsXG4gICAgICAgICAgICAgICAgXCJkcmFnRGlyZWN0aW9uXCIgOiBiYXNlLmRyYWdEaXJlY3Rpb25cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXJFdmVudHMgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLm9mZihcIi5vd2wgb3dsIG1vdXNlZG93bi5kaXNhYmxlVGV4dFNlbGVjdFwiKTtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZihcIi5vd2wgb3dsXCIpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZihcInJlc2l6ZVwiLCBiYXNlLnJlc2l6ZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHVuV3JhcCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcztcbiAgICAgICAgICAgIGlmIChiYXNlLiRlbGVtLmNoaWxkcmVuKCkubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kb3dsV3JhcHBlci51bndyYXAoKTtcbiAgICAgICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMudW53cmFwKCkudW53cmFwKCk7XG4gICAgICAgICAgICAgICAgaWYgKGJhc2Uub3dsQ29udHJvbHMpIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vd2xDb250cm9scy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiYXNlLmNsZWFyRXZlbnRzKCk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJzdHlsZVwiLCBiYXNlLiRlbGVtLmRhdGEoXCJvd2wtb3JpZ2luYWxTdHlsZXNcIikgfHwgXCJcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGJhc2UuJGVsZW0uZGF0YShcIm93bC1vcmlnaW5hbENsYXNzZXNcIikpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlc3Ryb3kgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYmFzZSA9IHRoaXM7XG4gICAgICAgICAgICBiYXNlLnN0b3AoKTtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKGJhc2UuY2hlY2tWaXNpYmxlKTtcbiAgICAgICAgICAgIGJhc2UudW5XcmFwKCk7XG4gICAgICAgICAgICBiYXNlLiRlbGVtLnJlbW92ZURhdGEoKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZWluaXQgOiBmdW5jdGlvbiAobmV3T3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgYmFzZS51c2VyT3B0aW9ucywgbmV3T3B0aW9ucyk7XG4gICAgICAgICAgICBiYXNlLnVuV3JhcCgpO1xuICAgICAgICAgICAgYmFzZS5pbml0KG9wdGlvbnMsIGJhc2UuJGVsZW0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkZEl0ZW0gOiBmdW5jdGlvbiAoaHRtbFN0cmluZywgdGFyZ2V0UG9zaXRpb24pIHtcbiAgICAgICAgICAgIHZhciBiYXNlID0gdGhpcyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjtcblxuICAgICAgICAgICAgaWYgKCFodG1sU3RyaW5nKSB7cmV0dXJuIGZhbHNlOyB9XG5cbiAgICAgICAgICAgIGlmIChiYXNlLiRlbGVtLmNoaWxkcmVuKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYmFzZS4kZWxlbS5hcHBlbmQoaHRtbFN0cmluZyk7XG4gICAgICAgICAgICAgICAgYmFzZS5zZXRWYXJzKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmFzZS51bldyYXAoKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXRQb3NpdGlvbiA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldFBvc2l0aW9uID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gLTE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocG9zaXRpb24gPj0gYmFzZS4kdXNlckl0ZW1zLmxlbmd0aCB8fCBwb3NpdGlvbiA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMuZXEoLTEpLmFmdGVyKGh0bWxTdHJpbmcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMuZXEocG9zaXRpb24pLmJlZm9yZShodG1sU3RyaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYmFzZS5zZXRWYXJzKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlSXRlbSA6IGZ1bmN0aW9uICh0YXJnZXRQb3NpdGlvbikge1xuICAgICAgICAgICAgdmFyIGJhc2UgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uO1xuXG4gICAgICAgICAgICBpZiAoYmFzZS4kZWxlbS5jaGlsZHJlbigpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0YXJnZXRQb3NpdGlvbiA9PT0gdW5kZWZpbmVkIHx8IHRhcmdldFBvc2l0aW9uID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gLTE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gdGFyZ2V0UG9zaXRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJhc2UudW5XcmFwKCk7XG4gICAgICAgICAgICBiYXNlLiR1c2VySXRlbXMuZXEocG9zaXRpb24pLnJlbW92ZSgpO1xuICAgICAgICAgICAgYmFzZS5zZXRWYXJzKCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICAkLmZuLm93bENhcm91c2VsID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoJCh0aGlzKS5kYXRhKFwib3dsLWluaXRcIikgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkKHRoaXMpLmRhdGEoXCJvd2wtaW5pdFwiLCB0cnVlKTtcbiAgICAgICAgICAgIHZhciBjYXJvdXNlbCA9IE9iamVjdC5jcmVhdGUoQ2Fyb3VzZWwpO1xuICAgICAgICAgICAgY2Fyb3VzZWwuaW5pdChvcHRpb25zLCB0aGlzKTtcbiAgICAgICAgICAgICQuZGF0YSh0aGlzLCBcIm93bENhcm91c2VsXCIsIGNhcm91c2VsKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICQuZm4ub3dsQ2Fyb3VzZWwub3B0aW9ucyA9IHtcblxuICAgICAgICBpdGVtcyA6IDUsXG4gICAgICAgIGl0ZW1zQ3VzdG9tIDogZmFsc2UsXG4gICAgICAgIGl0ZW1zRGVza3RvcCA6IFsxMTk5LCA0XSxcbiAgICAgICAgaXRlbXNEZXNrdG9wU21hbGwgOiBbOTc5LCAzXSxcbiAgICAgICAgaXRlbXNUYWJsZXQgOiBbNzY4LCAyXSxcbiAgICAgICAgaXRlbXNUYWJsZXRTbWFsbCA6IGZhbHNlLFxuICAgICAgICBpdGVtc01vYmlsZSA6IFs0NzksIDFdLFxuICAgICAgICBzaW5nbGVJdGVtIDogZmFsc2UsXG4gICAgICAgIGl0ZW1zU2NhbGVVcCA6IGZhbHNlLFxuXG4gICAgICAgIHNsaWRlU3BlZWQgOiAyMDAsXG4gICAgICAgIHBhZ2luYXRpb25TcGVlZCA6IDgwMCxcbiAgICAgICAgcmV3aW5kU3BlZWQgOiAxMDAwLFxuXG4gICAgICAgIGF1dG9QbGF5IDogZmFsc2UsXG4gICAgICAgIHN0b3BPbkhvdmVyIDogZmFsc2UsXG5cbiAgICAgICAgbmF2aWdhdGlvbiA6IGZhbHNlLFxuICAgICAgICBuYXZpZ2F0aW9uVGV4dCA6IFtcInByZXZcIiwgXCJuZXh0XCJdLFxuICAgICAgICByZXdpbmROYXYgOiB0cnVlLFxuICAgICAgICBzY3JvbGxQZXJQYWdlIDogZmFsc2UsXG5cbiAgICAgICAgcGFnaW5hdGlvbiA6IHRydWUsXG4gICAgICAgIHBhZ2luYXRpb25OdW1iZXJzIDogZmFsc2UsXG5cbiAgICAgICAgcmVzcG9uc2l2ZSA6IHRydWUsXG4gICAgICAgIHJlc3BvbnNpdmVSZWZyZXNoUmF0ZSA6IDIwMCxcbiAgICAgICAgcmVzcG9uc2l2ZUJhc2VXaWR0aCA6IHdpbmRvdyxcblxuICAgICAgICBiYXNlQ2xhc3MgOiBcIm93bC1jYXJvdXNlbFwiLFxuICAgICAgICB0aGVtZSA6IFwib3dsLXRoZW1lXCIsXG5cbiAgICAgICAgbGF6eUxvYWQgOiBmYWxzZSxcbiAgICAgICAgbGF6eUZvbGxvdyA6IHRydWUsXG4gICAgICAgIGxhenlFZmZlY3QgOiBcImZhZGVcIixcblxuICAgICAgICBhdXRvSGVpZ2h0IDogZmFsc2UsXG5cbiAgICAgICAganNvblBhdGggOiBmYWxzZSxcbiAgICAgICAganNvblN1Y2Nlc3MgOiBmYWxzZSxcblxuICAgICAgICBkcmFnQmVmb3JlQW5pbUZpbmlzaCA6IHRydWUsXG4gICAgICAgIG1vdXNlRHJhZyA6IHRydWUsXG4gICAgICAgIHRvdWNoRHJhZyA6IHRydWUsXG5cbiAgICAgICAgYWRkQ2xhc3NBY3RpdmUgOiBmYWxzZSxcbiAgICAgICAgdHJhbnNpdGlvblN0eWxlIDogZmFsc2UsXG5cbiAgICAgICAgYmVmb3JlVXBkYXRlIDogZmFsc2UsXG4gICAgICAgIGFmdGVyVXBkYXRlIDogZmFsc2UsXG4gICAgICAgIGJlZm9yZUluaXQgOiBmYWxzZSxcbiAgICAgICAgYWZ0ZXJJbml0IDogZmFsc2UsXG4gICAgICAgIGJlZm9yZU1vdmUgOiBmYWxzZSxcbiAgICAgICAgYWZ0ZXJNb3ZlIDogZmFsc2UsXG4gICAgICAgIGFmdGVyQWN0aW9uIDogZmFsc2UsXG4gICAgICAgIHN0YXJ0RHJhZ2dpbmcgOiBmYWxzZSxcbiAgICAgICAgYWZ0ZXJMYXp5TG9hZDogZmFsc2VcbiAgICB9O1xufShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpKTsiLCIvLyBTbW9vdGhTY3JvbGwgZm9yIHdlYnNpdGVzIHYxLjIuMVxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBNSVQgbGljZW5zZS5cblxuLy8gUGVvcGxlIGludm9sdmVkXG4vLyAgLSBCYWxhenMgR2FsYW1ib3NpIChtYWludGFpbmVyKSAgXG4vLyAgLSBNaWNoYWVsIEhlcmYgICAgIChQdWxzZSBBbGdvcml0aG0pXG5cbihmdW5jdGlvbigpe1xuICBcbi8vIFNjcm9sbCBWYXJpYWJsZXMgKHR3ZWFrYWJsZSlcbnZhciBkZWZhdWx0T3B0aW9ucyA9IHtcblxuICAgIC8vIFNjcm9sbGluZyBDb3JlXG4gICAgZnJhbWVSYXRlICAgICAgICA6IDE1MCwgLy8gW0h6XVxuICAgIGFuaW1hdGlvblRpbWUgICAgOiA0MDAsIC8vIFtweF1cbiAgICBzdGVwU2l6ZSAgICAgICAgIDogMTIwLCAvLyBbcHhdXG5cbiAgICAvLyBQdWxzZSAobGVzcyB0d2Vha2FibGUpXG4gICAgLy8gcmF0aW8gb2YgXCJ0YWlsXCIgdG8gXCJhY2NlbGVyYXRpb25cIlxuICAgIHB1bHNlQWxnb3JpdGhtICAgOiB0cnVlLFxuICAgIHB1bHNlU2NhbGUgICAgICAgOiA4LFxuICAgIHB1bHNlTm9ybWFsaXplICAgOiAxLFxuXG4gICAgLy8gQWNjZWxlcmF0aW9uXG4gICAgYWNjZWxlcmF0aW9uRGVsdGEgOiAyMCwgIC8vIDIwXG4gICAgYWNjZWxlcmF0aW9uTWF4ICAgOiAxLCAgIC8vIDFcblxuICAgIC8vIEtleWJvYXJkIFNldHRpbmdzXG4gICAga2V5Ym9hcmRTdXBwb3J0ICAgOiB0cnVlLCAgLy8gb3B0aW9uXG4gICAgYXJyb3dTY3JvbGwgICAgICAgOiA1MCwgICAgIC8vIFtweF1cblxuICAgIC8vIE90aGVyXG4gICAgdG91Y2hwYWRTdXBwb3J0ICAgOiB0cnVlLFxuICAgIGZpeGVkQmFja2dyb3VuZCAgIDogdHJ1ZSwgXG4gICAgZXhjbHVkZWQgICAgICAgICAgOiBcIlwiICAgIFxufTtcblxudmFyIG9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcblxuXG4vLyBPdGhlciBWYXJpYWJsZXNcbnZhciBpc0V4Y2x1ZGVkID0gZmFsc2U7XG52YXIgaXNGcmFtZSA9IGZhbHNlO1xudmFyIGRpcmVjdGlvbiA9IHsgeDogMCwgeTogMCB9O1xudmFyIGluaXREb25lICA9IGZhbHNlO1xudmFyIHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG52YXIgYWN0aXZlRWxlbWVudDtcbnZhciBvYnNlcnZlcjtcbnZhciBkZWx0YUJ1ZmZlciA9IFsgMTIwLCAxMjAsIDEyMCBdO1xuXG52YXIga2V5ID0geyBsZWZ0OiAzNywgdXA6IDM4LCByaWdodDogMzksIGRvd246IDQwLCBzcGFjZWJhcjogMzIsIFxuICAgICAgICAgICAgcGFnZXVwOiAzMywgcGFnZWRvd246IDM0LCBlbmQ6IDM1LCBob21lOiAzNiB9O1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogU0VUVElOR1NcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxudmFyIG9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIElOSVRJQUxJWkVcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuLyoqXG4gKiBUZXN0cyBpZiBzbW9vdGggc2Nyb2xsaW5nIGlzIGFsbG93ZWQuIFNodXRzIGRvd24gZXZlcnl0aGluZyBpZiBub3QuXG4gKi9cbmZ1bmN0aW9uIGluaXRUZXN0KCkge1xuXG4gICAgdmFyIGRpc2FibGVLZXlib2FyZCA9IGZhbHNlOyBcbiAgICBcbiAgICAvLyBkaXNhYmxlIGtleWJvYXJkIHN1cHBvcnQgaWYgYW55dGhpbmcgYWJvdmUgcmVxdWVzdGVkIGl0XG4gICAgaWYgKGRpc2FibGVLZXlib2FyZCkge1xuICAgICAgICByZW1vdmVFdmVudChcImtleWRvd25cIiwga2V5ZG93bik7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMua2V5Ym9hcmRTdXBwb3J0ICYmICFkaXNhYmxlS2V5Ym9hcmQpIHtcbiAgICAgICAgYWRkRXZlbnQoXCJrZXlkb3duXCIsIGtleWRvd24pO1xuICAgIH1cbn1cblxuLyoqXG4gKiBTZXRzIHVwIHNjcm9sbHMgYXJyYXksIGRldGVybWluZXMgaWYgZnJhbWVzIGFyZSBpbnZvbHZlZC5cbiAqL1xuZnVuY3Rpb24gaW5pdCgpIHtcbiAgXG4gICAgaWYgKCFkb2N1bWVudC5ib2R5KSByZXR1cm47XG5cbiAgICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHk7XG4gICAgdmFyIGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgdmFyIHdpbmRvd0hlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDsgXG4gICAgdmFyIHNjcm9sbEhlaWdodCA9IGJvZHkuc2Nyb2xsSGVpZ2h0O1xuICAgIFxuICAgIC8vIGNoZWNrIGNvbXBhdCBtb2RlIGZvciByb290IGVsZW1lbnRcbiAgICByb290ID0gKGRvY3VtZW50LmNvbXBhdE1vZGUuaW5kZXhPZignQ1NTJykgPj0gMCkgPyBodG1sIDogYm9keTtcbiAgICBhY3RpdmVFbGVtZW50ID0gYm9keTtcbiAgICBcbiAgICBpbml0VGVzdCgpO1xuICAgIGluaXREb25lID0gdHJ1ZTtcblxuICAgIC8vIENoZWNrcyBpZiB0aGlzIHNjcmlwdCBpcyBydW5uaW5nIGluIGEgZnJhbWVcbiAgICBpZiAodG9wICE9IHNlbGYpIHtcbiAgICAgICAgaXNGcmFtZSA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmaXhlcyBhIGJ1ZyB3aGVyZSB0aGUgYXJlYXMgbGVmdCBhbmQgcmlnaHQgdG8gXG4gICAgICogdGhlIGNvbnRlbnQgZG9lcyBub3QgdHJpZ2dlciB0aGUgb25tb3VzZXdoZWVsIGV2ZW50XG4gICAgICogb24gc29tZSBwYWdlcy4gZS5nLjogaHRtbCwgYm9keSB7IGhlaWdodDogMTAwJSB9XG4gICAgICovXG4gICAgZWxzZSBpZiAoc2Nyb2xsSGVpZ2h0ID4gd2luZG93SGVpZ2h0ICYmXG4gICAgICAgICAgICAoYm9keS5vZmZzZXRIZWlnaHQgPD0gd2luZG93SGVpZ2h0IHx8IFxuICAgICAgICAgICAgIGh0bWwub2Zmc2V0SGVpZ2h0IDw9IHdpbmRvd0hlaWdodCkpIHtcblxuICAgICAgICBodG1sLnN0eWxlLmhlaWdodCA9ICdhdXRvJztcbiAgICAgICAgc2V0VGltZW91dChyZWZyZXNoLCAxMCk7XG5cbiAgICAgICAgLy8gY2xlYXJmaXhcbiAgICAgICAgaWYgKHJvb3Qub2Zmc2V0SGVpZ2h0IDw9IHdpbmRvd0hlaWdodCkge1xuICAgICAgICAgICAgdmFyIHVuZGVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTsgXHRcbiAgICAgICAgICAgIHVuZGVybGF5LnN0eWxlLmNsZWFyID0gXCJib3RoXCI7XG4gICAgICAgICAgICBib2R5LmFwcGVuZENoaWxkKHVuZGVybGF5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRpc2FibGUgZml4ZWQgYmFja2dyb3VuZFxuICAgIGlmICghb3B0aW9ucy5maXhlZEJhY2tncm91bmQgJiYgIWlzRXhjbHVkZWQpIHtcbiAgICAgICAgYm9keS5zdHlsZS5iYWNrZ3JvdW5kQXR0YWNobWVudCA9IFwic2Nyb2xsXCI7XG4gICAgICAgIGh0bWwuc3R5bGUuYmFja2dyb3VuZEF0dGFjaG1lbnQgPSBcInNjcm9sbFwiO1xuICAgIH1cbn1cblxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBTQ1JPTExJTkcgXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIFxudmFyIHF1ZSA9IFtdO1xudmFyIHBlbmRpbmcgPSBmYWxzZTtcbnZhciBsYXN0U2Nyb2xsID0gK25ldyBEYXRlO1xuXG4vKipcbiAqIFB1c2hlcyBzY3JvbGwgYWN0aW9ucyB0byB0aGUgc2Nyb2xsaW5nIHF1ZXVlLlxuICovXG5mdW5jdGlvbiBzY3JvbGxBcnJheShlbGVtLCBsZWZ0LCB0b3AsIGRlbGF5KSB7XG4gICAgXG4gICAgZGVsYXkgfHwgKGRlbGF5ID0gMTAwMCk7XG4gICAgZGlyZWN0aW9uQ2hlY2sobGVmdCwgdG9wKTtcblxuICAgIGlmIChvcHRpb25zLmFjY2VsZXJhdGlvbk1heCAhPSAxKSB7XG4gICAgICAgIHZhciBub3cgPSArbmV3IERhdGU7XG4gICAgICAgIHZhciBlbGFwc2VkID0gbm93IC0gbGFzdFNjcm9sbDtcbiAgICAgICAgaWYgKGVsYXBzZWQgPCBvcHRpb25zLmFjY2VsZXJhdGlvbkRlbHRhKSB7XG4gICAgICAgICAgICB2YXIgZmFjdG9yID0gKDEgKyAoMzAgLyBlbGFwc2VkKSkgLyAyO1xuICAgICAgICAgICAgaWYgKGZhY3RvciA+IDEpIHtcbiAgICAgICAgICAgICAgICBmYWN0b3IgPSBNYXRoLm1pbihmYWN0b3IsIG9wdGlvbnMuYWNjZWxlcmF0aW9uTWF4KTtcbiAgICAgICAgICAgICAgICBsZWZ0ICo9IGZhY3RvcjtcbiAgICAgICAgICAgICAgICB0b3AgICo9IGZhY3RvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBsYXN0U2Nyb2xsID0gK25ldyBEYXRlO1xuICAgIH0gICAgICAgICAgXG4gICAgXG4gICAgLy8gcHVzaCBhIHNjcm9sbCBjb21tYW5kXG4gICAgcXVlLnB1c2goe1xuICAgICAgICB4OiBsZWZ0LCBcbiAgICAgICAgeTogdG9wLCBcbiAgICAgICAgbGFzdFg6IChsZWZ0IDwgMCkgPyAwLjk5IDogLTAuOTksXG4gICAgICAgIGxhc3RZOiAodG9wICA8IDApID8gMC45OSA6IC0wLjk5LCBcbiAgICAgICAgc3RhcnQ6ICtuZXcgRGF0ZVxuICAgIH0pO1xuICAgICAgICBcbiAgICAvLyBkb24ndCBhY3QgaWYgdGhlcmUncyBhIHBlbmRpbmcgcXVldWVcbiAgICBpZiAocGVuZGluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfSAgXG5cbiAgICB2YXIgc2Nyb2xsV2luZG93ID0gKGVsZW0gPT09IGRvY3VtZW50LmJvZHkpO1xuICAgIFxuICAgIHZhciBzdGVwID0gZnVuY3Rpb24gKHRpbWUpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBub3cgPSArbmV3IERhdGU7XG4gICAgICAgIHZhciBzY3JvbGxYID0gMDtcbiAgICAgICAgdmFyIHNjcm9sbFkgPSAwOyBcbiAgICBcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBxdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdmFyIGl0ZW0gPSBxdWVbaV07XG4gICAgICAgICAgICB2YXIgZWxhcHNlZCAgPSBub3cgLSBpdGVtLnN0YXJ0O1xuICAgICAgICAgICAgdmFyIGZpbmlzaGVkID0gKGVsYXBzZWQgPj0gb3B0aW9ucy5hbmltYXRpb25UaW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gc2Nyb2xsIHBvc2l0aW9uOiBbMCwgMV1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IChmaW5pc2hlZCkgPyAxIDogZWxhcHNlZCAvIG9wdGlvbnMuYW5pbWF0aW9uVGltZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gZWFzaW5nIFtvcHRpb25hbF1cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnB1bHNlQWxnb3JpdGhtKSB7XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBwdWxzZShwb3NpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIG9ubHkgbmVlZCB0aGUgZGlmZmVyZW5jZVxuICAgICAgICAgICAgdmFyIHggPSAoaXRlbS54ICogcG9zaXRpb24gLSBpdGVtLmxhc3RYKSA+PiAwO1xuICAgICAgICAgICAgdmFyIHkgPSAoaXRlbS55ICogcG9zaXRpb24gLSBpdGVtLmxhc3RZKSA+PiAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBhZGQgdGhpcyB0byB0aGUgdG90YWwgc2Nyb2xsaW5nXG4gICAgICAgICAgICBzY3JvbGxYICs9IHg7XG4gICAgICAgICAgICBzY3JvbGxZICs9IHk7ICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBsYXN0IHZhbHVlc1xuICAgICAgICAgICAgaXRlbS5sYXN0WCArPSB4O1xuICAgICAgICAgICAgaXRlbS5sYXN0WSArPSB5O1xuICAgICAgICBcbiAgICAgICAgICAgIC8vIGRlbGV0ZSBhbmQgc3RlcCBiYWNrIGlmIGl0J3Mgb3ZlclxuICAgICAgICAgICAgaWYgKGZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgcXVlLnNwbGljZShpLCAxKTsgaS0tO1xuICAgICAgICAgICAgfSAgICAgICAgICAgXG4gICAgICAgIH1cblxuICAgICAgICAvLyBzY3JvbGwgbGVmdCBhbmQgdG9wXG4gICAgICAgIGlmIChzY3JvbGxXaW5kb3cpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxCeShzY3JvbGxYLCBzY3JvbGxZKTtcbiAgICAgICAgfSBcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoc2Nyb2xsWCkgZWxlbS5zY3JvbGxMZWZ0ICs9IHNjcm9sbFg7XG4gICAgICAgICAgICBpZiAoc2Nyb2xsWSkgZWxlbS5zY3JvbGxUb3AgICs9IHNjcm9sbFk7ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gY2xlYW4gdXAgaWYgdGhlcmUncyBub3RoaW5nIGxlZnQgdG8gZG9cbiAgICAgICAgaWYgKCFsZWZ0ICYmICF0b3ApIHtcbiAgICAgICAgICAgIHF1ZSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAocXVlLmxlbmd0aCkgeyBcbiAgICAgICAgICAgIHJlcXVlc3RGcmFtZShzdGVwLCBlbGVtLCAoZGVsYXkgLyBvcHRpb25zLmZyYW1lUmF0ZSArIDEpKTsgXG4gICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgcGVuZGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBcbiAgICAvLyBzdGFydCBhIG5ldyBxdWV1ZSBvZiBhY3Rpb25zXG4gICAgcmVxdWVzdEZyYW1lKHN0ZXAsIGVsZW0sIDApO1xuICAgIHBlbmRpbmcgPSB0cnVlO1xufVxuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogRVZFTlRTXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbi8qKlxuICogTW91c2Ugd2hlZWwgaGFuZGxlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuICovXG5mdW5jdGlvbiB3aGVlbChldmVudCkge1xuXG4gICAgaWYgKCFpbml0RG9uZSkge1xuICAgICAgICBpbml0KCk7XG4gICAgfVxuICAgIFxuICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgdmFyIG92ZXJmbG93aW5nID0gb3ZlcmZsb3dpbmdBbmNlc3Rvcih0YXJnZXQpO1xuICAgIFxuICAgIC8vIHVzZSBkZWZhdWx0IGlmIHRoZXJlJ3Mgbm8gb3ZlcmZsb3dpbmdcbiAgICAvLyBlbGVtZW50IG9yIGRlZmF1bHQgYWN0aW9uIGlzIHByZXZlbnRlZCAgICBcbiAgICBpZiAoIW92ZXJmbG93aW5nIHx8IGV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQgfHxcbiAgICAgICAgaXNOb2RlTmFtZShhY3RpdmVFbGVtZW50LCBcImVtYmVkXCIpIHx8XG4gICAgICAgKGlzTm9kZU5hbWUodGFyZ2V0LCBcImVtYmVkXCIpICYmIC9cXC5wZGYvaS50ZXN0KHRhcmdldC5zcmMpKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgZGVsdGFYID0gZXZlbnQud2hlZWxEZWx0YVggfHwgMDtcbiAgICB2YXIgZGVsdGFZID0gZXZlbnQud2hlZWxEZWx0YVkgfHwgMDtcbiAgICBcbiAgICAvLyB1c2Ugd2hlZWxEZWx0YSBpZiBkZWx0YVgvWSBpcyBub3QgYXZhaWxhYmxlXG4gICAgaWYgKCFkZWx0YVggJiYgIWRlbHRhWSkge1xuICAgICAgICBkZWx0YVkgPSBldmVudC53aGVlbERlbHRhIHx8IDA7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgaXQncyBhIHRvdWNocGFkIHNjcm9sbCB0aGF0IHNob3VsZCBiZSBpZ25vcmVkXG4gICAgaWYgKCFvcHRpb25zLnRvdWNocGFkU3VwcG9ydCAmJiBpc1RvdWNocGFkKGRlbHRhWSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gc2NhbGUgYnkgc3RlcCBzaXplXG4gICAgLy8gZGVsdGEgaXMgMTIwIG1vc3Qgb2YgdGhlIHRpbWVcbiAgICAvLyBzeW5hcHRpY3Mgc2VlbXMgdG8gc2VuZCAxIHNvbWV0aW1lc1xuICAgIGlmIChNYXRoLmFicyhkZWx0YVgpID4gMS4yKSB7XG4gICAgICAgIGRlbHRhWCAqPSBvcHRpb25zLnN0ZXBTaXplIC8gMTIwO1xuICAgIH1cbiAgICBpZiAoTWF0aC5hYnMoZGVsdGFZKSA+IDEuMikge1xuICAgICAgICBkZWx0YVkgKj0gb3B0aW9ucy5zdGVwU2l6ZSAvIDEyMDtcbiAgICB9XG4gICAgXG4gICAgc2Nyb2xsQXJyYXkob3ZlcmZsb3dpbmcsIC1kZWx0YVgsIC1kZWx0YVkpO1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG59XG5cbi8qKlxuICogS2V5ZG93biBldmVudCBoYW5kbGVyLlxuICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIGtleWRvd24oZXZlbnQpIHtcblxuICAgIHZhciB0YXJnZXQgICA9IGV2ZW50LnRhcmdldDtcbiAgICB2YXIgbW9kaWZpZXIgPSBldmVudC5jdHJsS2V5IHx8IGV2ZW50LmFsdEtleSB8fCBldmVudC5tZXRhS2V5IHx8IFxuICAgICAgICAgICAgICAgICAgKGV2ZW50LnNoaWZ0S2V5ICYmIGV2ZW50LmtleUNvZGUgIT09IGtleS5zcGFjZWJhcik7XG4gICAgXG4gICAgLy8gZG8gbm90aGluZyBpZiB1c2VyIGlzIGVkaXRpbmcgdGV4dFxuICAgIC8vIG9yIHVzaW5nIGEgbW9kaWZpZXIga2V5IChleGNlcHQgc2hpZnQpXG4gICAgLy8gb3IgaW4gYSBkcm9wZG93blxuICAgIGlmICggL2lucHV0fHRleHRhcmVhfHNlbGVjdHxlbWJlZC9pLnRlc3QodGFyZ2V0Lm5vZGVOYW1lKSB8fFxuICAgICAgICAgdGFyZ2V0LmlzQ29udGVudEVkaXRhYmxlIHx8IFxuICAgICAgICAgZXZlbnQuZGVmYXVsdFByZXZlbnRlZCAgIHx8XG4gICAgICAgICBtb2RpZmllciApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBzcGFjZWJhciBzaG91bGQgdHJpZ2dlciBidXR0b24gcHJlc3NcbiAgICBpZiAoaXNOb2RlTmFtZSh0YXJnZXQsIFwiYnV0dG9uXCIpICYmXG4gICAgICAgIGV2ZW50LmtleUNvZGUgPT09IGtleS5zcGFjZWJhcikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIFxuICAgIHZhciBzaGlmdCwgeCA9IDAsIHkgPSAwO1xuICAgIHZhciBlbGVtID0gb3ZlcmZsb3dpbmdBbmNlc3RvcihhY3RpdmVFbGVtZW50KTtcbiAgICB2YXIgY2xpZW50SGVpZ2h0ID0gZWxlbS5jbGllbnRIZWlnaHQ7XG5cbiAgICBpZiAoZWxlbSA9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgIGNsaWVudEhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgICAgY2FzZSBrZXkudXA6XG4gICAgICAgICAgICB5ID0gLW9wdGlvbnMuYXJyb3dTY3JvbGw7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBrZXkuZG93bjpcbiAgICAgICAgICAgIHkgPSBvcHRpb25zLmFycm93U2Nyb2xsO1xuICAgICAgICAgICAgYnJlYWs7ICAgICAgICAgXG4gICAgICAgIGNhc2Uga2V5LnNwYWNlYmFyOiAvLyAoKyBzaGlmdClcbiAgICAgICAgICAgIHNoaWZ0ID0gZXZlbnQuc2hpZnRLZXkgPyAxIDogLTE7XG4gICAgICAgICAgICB5ID0gLXNoaWZ0ICogY2xpZW50SGVpZ2h0ICogMC45O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5LnBhZ2V1cDpcbiAgICAgICAgICAgIHkgPSAtY2xpZW50SGVpZ2h0ICogMC45O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5LnBhZ2Vkb3duOlxuICAgICAgICAgICAgeSA9IGNsaWVudEhlaWdodCAqIDAuOTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGtleS5ob21lOlxuICAgICAgICAgICAgeSA9IC1lbGVtLnNjcm9sbFRvcDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIGtleS5lbmQ6XG4gICAgICAgICAgICB2YXIgZGFtdCA9IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5zY3JvbGxUb3AgLSBjbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB5ID0gKGRhbXQgPiAwKSA/IGRhbXQrMTAgOiAwO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2Uga2V5LmxlZnQ6XG4gICAgICAgICAgICB4ID0gLW9wdGlvbnMuYXJyb3dTY3JvbGw7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBrZXkucmlnaHQ6XG4gICAgICAgICAgICB4ID0gb3B0aW9ucy5hcnJvd1Njcm9sbDtcbiAgICAgICAgICAgIGJyZWFrOyAgICAgICAgICAgIFxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIGEga2V5IHdlIGRvbid0IGNhcmUgYWJvdXRcbiAgICB9XG5cbiAgICBzY3JvbGxBcnJheShlbGVtLCB4LCB5KTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xufVxuXG4vKipcbiAqIE1vdXNlZG93biBldmVudCBvbmx5IGZvciB1cGRhdGluZyBhY3RpdmVFbGVtZW50XG4gKi9cbmZ1bmN0aW9uIG1vdXNlZG93bihldmVudCkge1xuICAgIGFjdGl2ZUVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBPVkVSRkxPV1xuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIFxudmFyIGNhY2hlID0ge307IC8vIGNsZWFyZWQgb3V0IGV2ZXJ5IG9uY2UgaW4gd2hpbGVcbnNldEludGVydmFsKGZ1bmN0aW9uICgpIHsgY2FjaGUgPSB7fTsgfSwgMTAgKiAxMDAwKTtcblxudmFyIHVuaXF1ZUlEID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaSA9IDA7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICByZXR1cm4gZWwudW5pcXVlSUQgfHwgKGVsLnVuaXF1ZUlEID0gaSsrKTtcbiAgICB9O1xufSkoKTtcblxuZnVuY3Rpb24gc2V0Q2FjaGUoZWxlbXMsIG92ZXJmbG93aW5nKSB7XG4gICAgZm9yICh2YXIgaSA9IGVsZW1zLmxlbmd0aDsgaS0tOylcbiAgICAgICAgY2FjaGVbdW5pcXVlSUQoZWxlbXNbaV0pXSA9IG92ZXJmbG93aW5nO1xuICAgIHJldHVybiBvdmVyZmxvd2luZztcbn1cblxuZnVuY3Rpb24gb3ZlcmZsb3dpbmdBbmNlc3RvcihlbCkge1xuICAgIHZhciBlbGVtcyA9IFtdO1xuICAgIHZhciByb290U2Nyb2xsSGVpZ2h0ID0gcm9vdC5zY3JvbGxIZWlnaHQ7XG4gICAgZG8ge1xuICAgICAgICB2YXIgY2FjaGVkID0gY2FjaGVbdW5pcXVlSUQoZWwpXTtcbiAgICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICAgICAgcmV0dXJuIHNldENhY2hlKGVsZW1zLCBjYWNoZWQpO1xuICAgICAgICB9XG4gICAgICAgIGVsZW1zLnB1c2goZWwpO1xuICAgICAgICBpZiAocm9vdFNjcm9sbEhlaWdodCA9PT0gZWwuc2Nyb2xsSGVpZ2h0KSB7XG4gICAgICAgICAgICBpZiAoIWlzRnJhbWUgfHwgcm9vdC5jbGllbnRIZWlnaHQgKyAxMCA8IHJvb3RTY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2FjaGUoZWxlbXMsIGRvY3VtZW50LmJvZHkpOyAvLyBzY3JvbGxpbmcgcm9vdCBpbiBXZWJLaXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChlbC5jbGllbnRIZWlnaHQgKyAxMCA8IGVsLnNjcm9sbEhlaWdodCkge1xuICAgICAgICAgICAgb3ZlcmZsb3cgPSBnZXRDb21wdXRlZFN0eWxlKGVsLCBcIlwiKS5nZXRQcm9wZXJ0eVZhbHVlKFwib3ZlcmZsb3cteVwiKTtcbiAgICAgICAgICAgIGlmIChvdmVyZmxvdyA9PT0gXCJzY3JvbGxcIiB8fCBvdmVyZmxvdyA9PT0gXCJhdXRvXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0Q2FjaGUoZWxlbXMsIGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gd2hpbGUgKGVsID0gZWwucGFyZW50Tm9kZSk7XG59XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBIRUxQRVJTXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmZ1bmN0aW9uIGFkZEV2ZW50KHR5cGUsIGZuLCBidWJibGUpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBmbiwgKGJ1YmJsZXx8ZmFsc2UpKTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRXZlbnQodHlwZSwgZm4sIGJ1YmJsZSkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCAoYnViYmxlfHxmYWxzZSkpOyAgXG59XG5cbmZ1bmN0aW9uIGlzTm9kZU5hbWUoZWwsIHRhZykge1xuICAgIHJldHVybiAoZWwubm9kZU5hbWV8fFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IHRhZy50b0xvd2VyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiBkaXJlY3Rpb25DaGVjayh4LCB5KSB7XG4gICAgeCA9ICh4ID4gMCkgPyAxIDogLTE7XG4gICAgeSA9ICh5ID4gMCkgPyAxIDogLTE7XG4gICAgaWYgKGRpcmVjdGlvbi54ICE9PSB4IHx8IGRpcmVjdGlvbi55ICE9PSB5KSB7XG4gICAgICAgIGRpcmVjdGlvbi54ID0geDtcbiAgICAgICAgZGlyZWN0aW9uLnkgPSB5O1xuICAgICAgICBxdWUgPSBbXTtcbiAgICAgICAgbGFzdFNjcm9sbCA9IDA7XG4gICAgfVxufVxuXG52YXIgZGVsdGFCdWZmZXJUaW1lcjtcblxuZnVuY3Rpb24gaXNUb3VjaHBhZChkZWx0YVkpIHtcbiAgICBpZiAoIWRlbHRhWSkgcmV0dXJuO1xuICAgIGRlbHRhWSA9IE1hdGguYWJzKGRlbHRhWSlcbiAgICBkZWx0YUJ1ZmZlci5wdXNoKGRlbHRhWSk7XG4gICAgZGVsdGFCdWZmZXIuc2hpZnQoKTtcbiAgICBjbGVhclRpbWVvdXQoZGVsdGFCdWZmZXJUaW1lcik7XG5cbiAgICB2YXIgYWxsRXF1YWxzICAgID0gKGRlbHRhQnVmZmVyWzBdID09IGRlbHRhQnVmZmVyWzFdICYmIFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVsdGFCdWZmZXJbMV0gPT0gZGVsdGFCdWZmZXJbMl0pO1xuICAgIHZhciBhbGxEaXZpc2FibGUgPSAoaXNEaXZpc2libGUoZGVsdGFCdWZmZXJbMF0sIDEyMCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRGl2aXNpYmxlKGRlbHRhQnVmZmVyWzFdLCAxMjApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0RpdmlzaWJsZShkZWx0YUJ1ZmZlclsyXSwgMTIwKSk7XG4gICAgcmV0dXJuICEoYWxsRXF1YWxzIHx8IGFsbERpdmlzYWJsZSk7XG59IFxuXG5mdW5jdGlvbiBpc0RpdmlzaWJsZShuLCBkaXZpc29yKSB7XG4gICAgcmV0dXJuIChNYXRoLmZsb29yKG4gLyBkaXZpc29yKSA9PSBuIC8gZGl2aXNvcik7XG59XG5cbnZhciByZXF1ZXN0RnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lICAgICAgIHx8IFxuICAgICAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoY2FsbGJhY2ssIGVsZW1lbnQsIGRlbGF5KSB7XG4gICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgZGVsYXkgfHwgKDEwMDAvNjApKTtcbiAgICAgICAgICAgICAgfTtcbn0pKCk7XG5cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBQVUxTRVxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIFxuLyoqXG4gKiBWaXNjb3VzIGZsdWlkIHdpdGggYSBwdWxzZSBmb3IgcGFydCBhbmQgZGVjYXkgZm9yIHRoZSByZXN0LlxuICogLSBBcHBsaWVzIGEgZml4ZWQgZm9yY2Ugb3ZlciBhbiBpbnRlcnZhbCAoYSBkYW1wZWQgYWNjZWxlcmF0aW9uKSwgYW5kXG4gKiAtIExldHMgdGhlIGV4cG9uZW50aWFsIGJsZWVkIGF3YXkgdGhlIHZlbG9jaXR5IG92ZXIgYSBsb25nZXIgaW50ZXJ2YWxcbiAqIC0gTWljaGFlbCBIZXJmLCBodHRwOi8vc3RlcmVvcHNpcy5jb20vc3RvcHBpbmcvXG4gKi9cbmZ1bmN0aW9uIHB1bHNlXyh4KSB7XG4gICAgdmFyIHZhbCwgc3RhcnQsIGV4cHg7XG4gICAgLy8gdGVzdFxuICAgIHggPSB4ICogb3B0aW9ucy5wdWxzZVNjYWxlO1xuICAgIGlmICh4IDwgMSkgeyAvLyBhY2NlbGVhcnRpb25cbiAgICAgICAgdmFsID0geCAtICgxIC0gTWF0aC5leHAoLXgpKTtcbiAgICB9IGVsc2UgeyAgICAgLy8gdGFpbFxuICAgICAgICAvLyB0aGUgcHJldmlvdXMgYW5pbWF0aW9uIGVuZGVkIGhlcmU6XG4gICAgICAgIHN0YXJ0ID0gTWF0aC5leHAoLTEpO1xuICAgICAgICAvLyBzaW1wbGUgdmlzY291cyBkcmFnXG4gICAgICAgIHggLT0gMTtcbiAgICAgICAgZXhweCA9IDEgLSBNYXRoLmV4cCgteCk7XG4gICAgICAgIHZhbCA9IHN0YXJ0ICsgKGV4cHggKiAoMSAtIHN0YXJ0KSk7XG4gICAgfVxuICAgIHJldHVybiB2YWwgKiBvcHRpb25zLnB1bHNlTm9ybWFsaXplO1xufVxuXG5mdW5jdGlvbiBwdWxzZSh4KSB7XG4gICAgaWYgKHggPj0gMSkgcmV0dXJuIDE7XG4gICAgaWYgKHggPD0gMCkgcmV0dXJuIDA7XG5cbiAgICBpZiAob3B0aW9ucy5wdWxzZU5vcm1hbGl6ZSA9PSAxKSB7XG4gICAgICAgIG9wdGlvbnMucHVsc2VOb3JtYWxpemUgLz0gcHVsc2VfKDEpO1xuICAgIH1cbiAgICByZXR1cm4gcHVsc2VfKHgpO1xufVxuXG52YXIgaXNDaHJvbWUgPSAvY2hyb21lL2kudGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCk7XG52YXIgaXNNb3VzZVdoZWVsU3VwcG9ydGVkID0gJ29ubW91c2V3aGVlbCcgaW4gZG9jdW1lbnQ7IFxuXG5pZiAoaXNNb3VzZVdoZWVsU3VwcG9ydGVkICYmIGlzQ2hyb21lKSB7XG5cdGFkZEV2ZW50KFwibW91c2Vkb3duXCIsIG1vdXNlZG93bik7XG5cdGFkZEV2ZW50KFwibW91c2V3aGVlbFwiLCB3aGVlbCk7XG5cdGFkZEV2ZW50KFwibG9hZFwiLCBpbml0KTtcbn07XG5cbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
