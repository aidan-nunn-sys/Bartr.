package bartr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@SpringBootApplication
@Controller
public class BartrApplication {
	public static void main(String[] args) {
		SpringApplication.run(BartrApplication.class, args);
	}

	@RequestMapping(value = { "/", "/{path:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
